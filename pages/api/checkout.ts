import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { NORVINE_CONFIG } from '@/types/norvine-default';
import { processPayment } from '@/lib/payment-service';

const PLATFORM_SERVICE_FEE = NORVINE_CONFIG.SERVICE_FEE;
const PLATFORM_INSURANCE = NORVINE_CONFIG.INSURANCE_RATE;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Silakan login." });

    const { 
      orderId, paymentGateway, paymentMethod, shippingService, 
      useInsurance, items, promoCode, address, recipientName, 
      recipientPhone, district, city, totalWeight, dimensions, notes
    } = req.body;

    const userId = (session.user as any).id;

    // --- 1. VALIDASI ONGKIR (OUTSIDE TRANSACTION) ---
    let shippingCost = 0;
    try {
      const destStr = `${district}, ${city}`.toUpperCase();
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

      // C. Kalkulasi Final (Insurance 0.27% setelah diskon)
      const finalSubtotal = serverSubtotal - serverDiscount;
      const insuranceCost = useInsurance ?  Math.round(finalSubtotal * PLATFORM_INSURANCE) : 0;
      const finalAmount = finalSubtotal + shippingCost + insuranceCost + PLATFORM_SERVICE_FEE;

      // D. PANGGIL SERVICE PAYMENT (Pemisahan Logic Gateway)
      const paymentRes = await processPayment(paymentGateway, {
        orderId,
        finalAmount,
        paymentMethod,
        customerDetails: { 
          email: session.user?.email, 
          first_name: recipientName, 
          phone: recipientPhone,
          shipping_address: { address, phone: recipientPhone, first_name: recipientName }
        },
        itemDetails: [
          ...validatedItems.map(i => ({ id: i.variantId, price: i.price, quantity: i.quantity, name: i.name })),
          { id: 'SHIPPING', name: `Ongkir ${shippingService}`, price: shippingCost, quantity: 1 },
          { id: 'FEE_SERVICE', name: 'Biaya Layanan', price: PLATFORM_SERVICE_FEE, quantity: 1 },
          ...(insuranceCost > 0 ? [{ id: 'INSURANCE', name: 'Asuransi', price: insuranceCost, quantity: 1 }] : []),
          ...(serverDiscount > 0 ? [{ id: 'PROMO', name: 'Promo', price: -serverDiscount, quantity: 1 }] : [])
        ]
      });

      // E. Update Stok
      for (const item of validatedItems) {
        await tx.productVariant.update({ 
          where: { id: item.variantId }, 
          data: { stock: { decrement: item.quantity } } 
        });
      }

      // F. Simpan Transaksi
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
          paymentMethod: `${paymentGateway}_${paymentMethod}`,
          userId,
          promoId,
          notes: notes || null,
          midtransOrderId: paymentRes.gatewayId,
          vaNumber: paymentRes.vaNumber,
          bankName: paymentRes.bankName,
          qrUrl: paymentRes.qrUrl,
          deepLink: paymentRes.deepLink,
          paymentExpiry: paymentRes.expiry,
          rawPaymentRes: paymentRes.raw as any, 
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

      return { transaction, paymentUrl: paymentRes.deepLink };
    }, {
      timeout: 20000 // Waktu lebih lama untuk proses payment gateway
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("CHARGE ERROR:", error.message);
    return res.status(400).json({ error: error.message });
  }
}