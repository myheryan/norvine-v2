import { NextApiRequest, NextApiResponse } from 'next';
import { coreApi } from '@/lib/midtrans';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { NORVINE_CONFIG } from '@/types/norvine-default';

const PLATFORM_SERVICE_FEE = NORVINE_CONFIG.SERVICE_FEE;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Silakan login." });

    const { 
      orderId, paymentMethod, shippingService, 
      useInsurance, items, promoCode, address, recipientName, 
      recipientPhone, district, city, totalWeight, dimensions, notes
    } = req.body;

    const userId = (session.user as any).id;

    // --- 1. VALIDASI ONGKIR (DI LUAR TRANSAKSI DB AGAR TIDAK TIMEOUT) ---
    let shippingCost = 0;
    try {
      const destStr = `${district}, ${city}`.toUpperCase();
      // Tips: Gunakan URL absolut untuk fetch internal
      const shipRes = await fetch(`${process.env.NEXTAUTH_URL}/api/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destination: destStr, 
          weight: totalWeight,
          width: dimensions?.width || 10,
          length: dimensions?.length || 10,
          height: dimensions?.height || 10
        })
      });
      const shipData = await shipRes.json();
      const matchedService = shipData.result?.find((s: any) => s.product === shippingService);
      
      if (!matchedService) throw new Error("Layanan pengiriman tidak tersedia.");
      shippingCost = matchedService.total_tariff;
    } catch (e) {
      throw new Error("Gagal validasi ongkos kirim. Pastikan alamat lengkap.");
    }

    // --- 2. MULAI TRANSAKSI DATABASE ---
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Validasi Stok & Harga Produk
      const variantIds = items.map((i: any) => i.variantId);
      const dbVariants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true }
      });

      let serverSubtotal = 0;
      const validatedItems = items.map((item: any) => {
        const dbV = dbVariants.find(v => v.id === item.variantId);
        if (!dbV) throw new Error(`Produk tidak ditemukan.`);
        if (dbV.stock < item.quantity) throw new Error(`Stok ${dbV.product.name} habis.`);
        
        serverSubtotal += dbV.price * item.quantity;
        return {
          variantId: dbV.id,
          productId: dbV.productId,
          name: `${dbV.product.name} - ${dbV.name}`.substring(0, 50),
          price: dbV.price,
          quantity: item.quantity
        };
      });

      // B. Validasi Promo
      let serverDiscount = 0;
      let promoId: number | null = null;
      if (promoCode) {
        const promo = await tx.promo.findUnique({ where: { code: String(promoCode).toUpperCase() } });
        if (promo && promo.status === 'ACTIVE' && serverSubtotal >= (promo.minOrder || 0)) {
          promoId = promo.id;
          serverDiscount = promo.value;
          await tx.promo.update({ where: { id: promo.id }, data: { used: { increment: 1 } } });
        }
      }

      // C. Kalkulasi Final
      const insuranceCost = useInsurance ? Math.round(serverSubtotal * 0.002) : 0;
      const finalAmount = serverSubtotal - serverDiscount + shippingCost + insuranceCost + PLATFORM_SERVICE_FEE;

      // D. Midtrans Charge
      const midtransParam: any = {
        payment_type: paymentMethod === "qris" ? "qris" : "bank_transfer",
        transaction_details: { order_id: orderId, gross_amount: Math.round(finalAmount) },
        item_details: [
          ...validatedItems.map(i => ({ id: i.variantId, price: i.price, quantity: i.quantity, name: i.name })),
          { id: 'SHIPPING', name: `Ongkir ${shippingService}`, price: shippingCost, quantity: 1 },
          { id: 'FEE_SERVICE', name: 'Biaya Layanan', price: PLATFORM_SERVICE_FEE, quantity: 1 }
        ],
        customer_details: {
          email: session.user?.email,
          first_name: recipientName,
          phone: recipientPhone,
          shipping_address: { address, phone: recipientPhone, first_name: recipientName }
        }
      };

      if (insuranceCost > 0) midtransParam.item_details.push({ id: 'INSURANCE', name: 'Asuransi', price: insuranceCost, quantity: 1 });
      if (serverDiscount > 0) midtransParam.item_details.push({ id: 'PROMO', name: 'Promo', price: -serverDiscount, quantity: 1 });
      if (paymentMethod !== "qris") midtransParam.bank_transfer = { bank: paymentMethod.replace('_va', '') };

      const chargeResponse = await coreApi.charge(midtransParam);

      // E. Update Stok
      for (const item of validatedItems) {
        await tx.productVariant.update({ 
          where: { id: item.variantId }, 
          data: { stock: { decrement: item.quantity } } 
        });
      }

      // F. Simpan Transaksi (Tanpa nested history untuk hindari fkey error)
      const transaction = await tx.transaction.create({
        data: {
          invoice: orderId,
          status: "PENDING",
          subtotal: serverSubtotal,
          discount: serverDiscount,
          shippingCost,
          insuranceCost,
          serviceFee: PLATFORM_SERVICE_FEE,
          totalAmount: Math.round(finalAmount),
          shippingAddress: address,
          recipientName,
          recipientPhone,
          paymentMethod,
          userId,
          promoId,
          midtransOrderId: chargeResponse.transaction_id,
          vaNumber: chargeResponse.va_numbers?.[0]?.va_number || null,
          bankName: chargeResponse.va_numbers?.[0]?.bank || (paymentMethod === 'qris' ? 'QRIS' : paymentMethod),
          qrUrl: chargeResponse.actions?.find((a: any) => a.name === "generate-qr-code")?.url || null,
          paymentExpiry: chargeResponse.expiry_time ? new Date(chargeResponse.expiry_time) : null,
          rawPaymentRes: chargeResponse as any, 
          items: {
            create: validatedItems.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtBuy: item.price,
            })),
          },
        },
      });

      // G. Buat History secara eksplisit
      await tx.orderHistory.create({
        data: {
          transactionId: transaction.id,
          status: "PENDING",
          notes: "Menunggu pembayaran."
        }
      });

      return { transaction };
    }, {
      timeout: 10000 // Beri waktu 10 detik karena proses Midtrans cukup lama
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("CHARGE ERROR:", error.message);
    return res.status(400).json({ error: error.message });
  }
}