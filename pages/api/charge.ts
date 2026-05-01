import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { NORVINE_CONFIG } from '@/types/norvine-default';
import { sendInvoiceEmail } from '@/lib/invoice-service';
import { formatPhoneNumber } from '@/lib/utils';

const PLATFORM_SERVICE_FEE = NORVINE_CONFIG.SERVICE_FEE;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Silakan login ulang." });

    const { 
      orderId, items, promoCode, recipientName, recipientPhone, 
      notes, shippingDetails, addressSnapshot, useInsurance 
    } = req.body;

    const userId = (session.user as any).id;
    const shippingCost = Math.round(shippingDetails?.tariff || 0);

    // 1. DOUBLE ORDER PROTECTION
    const pendingOrder = await prisma.transaction.findFirst({
      where: { userId, status: "PENDING", paymentExpiry: { gt: new Date() } },
      select: { invoice: true }
    });
    if (pendingOrder) throw new Error(`Selesaikan pembayaran pesanan #${pendingOrder.invoice} terlebih dahulu.`);

    const result = await prisma.$transaction(async (tx) => {
      
      // 2. VALIDASI PRODUK & AVAILABILITY GUARD
      const variantIds = items.map((i: any) => i.variantId);
      const dbVariants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true }
      });

      let serverSubtotal = 0;
      const validatedItems = items.map((item: any) => {
        const dbV = dbVariants.find(v => v.id === item.variantId);
        
        if (!dbV) throw new Error(`Produk tidak ditemukan.`);
        // Tambahan: Guard untuk status produk
        if (!dbV.product.isAvailable) throw new Error(`Produk ${dbV.product.name} sedang tidak tersedia.`);
        if (dbV.product.isDisplayOnly) throw new Error(`${dbV.product.name} hanya untuk pajangan.`);
        if (dbV.stock < item.quantity) throw new Error(`Stok ${dbV.product.name} tidak mencukupi.`);
        
        const itemPrice = Math.round(dbV.price);
        serverSubtotal += itemPrice * item.quantity;

        return {
          variantId: dbV.id,
          productId: dbV.productId,
          name: `${dbV.product.name} - ${dbV.name}`.substring(0, 50),
          price: itemPrice,
          quantity: item.quantity,
          weight: dbV.weight || 0
        };
      });

      // 3. LOGIKA PROMO & DISCOUNT
      let serverDiscount = 0;
      let promoId: number | null = null;
      if (promoCode) {
        const promo = await tx.promo.findUnique({ where: { code: String(promoCode).toUpperCase() } });
        if (promo && promo.status === 'ACTIVE' && serverSubtotal >= (promo.minOrder || 0)) {
          // Cek kuota promo
          if (promo.limit > 0 && promo.used >= promo.limit) throw new Error("Kuota promo sudah habis.");
          
          promoId = promo.id;
          serverDiscount = promo.type === 'PERCENT' 
            ? Math.min(Math.floor((serverSubtotal * promo.value) / 100), promo.maxDiscount || Infinity)
            : promo.value;
          
          await tx.promo.update({ where: { id: promo.id }, data: { used: { increment: 1 } } });
        }
      }

      // 4. KALKULASI FINAL
      const finalSubtotal = serverSubtotal - serverDiscount;
      const insuranceCost = useInsurance ? Math.round(finalSubtotal * NORVINE_CONFIG.INSURANCE_RATE) : 0;
      const totalToCharge = Math.round(finalSubtotal + shippingCost + PLATFORM_SERVICE_FEE + insuranceCost);
      
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 60);

      // 5. CONSTRUCT BASKET UNTUK XENDIT (Sesuai Spec Baru)
      const basket: any[] = validatedItems.map(i => ({
        reference_id: i.variantId,
        name: i.name,
        currency: 'IDR',
        price: i.price,
        quantity: i.quantity,
        type: 'PRODUCT'
      }));

      if (shippingCost > 0) {
        basket.push({ reference_id: 'SHIPPING', name: 'Ongkos Kirim', currency: 'IDR', price: shippingCost, quantity: 1, type: 'SERVICE' });
      }
      if (PLATFORM_SERVICE_FEE > 0) {
        basket.push({ reference_id: 'SERVICE_FEE', name: 'Biaya Layanan', currency: 'IDR', price: PLATFORM_SERVICE_FEE, quantity: 1, type: 'SERVICE' });
      }
      if (insuranceCost > 0) {
        basket.push({ reference_id: 'INSURANCE', name: 'Asuransi Pengiriman', currency: 'IDR', price: insuranceCost, quantity: 1, type: 'SERVICE' });
      }
      if (serverDiscount > 0) {
        basket.push({ reference_id: 'PROMO_DISCOUNT', name: 'Potongan Promo', currency: 'IDR', price: -serverDiscount, quantity: 1, type: 'PRODUCT' });
      }

      // 6. HIT XENDIT DENGAN METADATA CASTING
      const encodedKey = Buffer.from(process.env.XENDIT_SECRET_KEY).toString('base64');

      const xenditRes = await fetch('https://api.xendit.co/qr_codes', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
          'api-version' : '2022-07-31'

        },
        body: JSON.stringify({
          reference_id: String(orderId), // Required at root
          external_id: String(orderId),
          type: 'DYNAMIC',
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/xendit`,
          currency: 'IDR',
          amount: totalToCharge,
          expires_at: expiryDate.toISOString(),
          basket: basket, // Integrated Basket
          metadata: {
            invoice: String(orderId),
            user_id: String(userId),
            customer: String(recipientName),
            courier: String(shippingDetails.courierService),
            source: "NORVINE_WEB_V2_PRO"
          },
          customer: {
            reference_id: String(userId),
            given_names: recipientName.substring(0, 255),
            email: session.user?.email || "customer@norvine.co.id",
            mobile_number: formatPhoneNumber(recipientPhone)
          }
          
        }),
      });

      const chargeRes = await xenditRes.json();
      if (!xenditRes.ok) throw new Error(chargeRes.message || "Gagal membuat QRIS Xendit");

      // 7. STOCK LOGGING & UPDATES
      for (const item of validatedItems) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
        // Audit Trail: Catat di StockLog
        await tx.stockLog.create({
          data: { variantId: item.variantId, change: -item.quantity, reason: `SALE: ${orderId}` }
        });
      }

      // 8. CREATE TRANSACTION WITH AUDIT TRAIL
      const transaction = await tx.transaction.create({
        data: {
          invoice: orderId,
          userId,
          status: "PENDING",
          notes: notes || "",
          subtotal: serverSubtotal,
          discount: serverDiscount,
          shippingCost,
          insuranceCost,
          serviceFee: PLATFORM_SERVICE_FEE,
          totalAmount: totalToCharge,
          paymentMethod: 'qris',
          bankName: 'QRIS',
          qrUrl: chargeRes.qr_string,
          midtransOrderId: chargeRes.id, 
          paymentExpiry: expiryDate,
          rawPaymentRes: chargeRes, // Simpan respon mentah Xendit
          
          shippingAddress: {
            create: {
              recipientName,
              recipientPhone,
              fullAddress: addressSnapshot.fullAddress,
              province: addressSnapshot.province,
              city: addressSnapshot.city,
              district: addressSnapshot.district,
              postalCode: addressSnapshot.postalCode,
            }
          },

          shipment: {
            create: {
              courierCode: shippingDetails.courierCode,
              courierService: shippingDetails.courierService,
              destination: `${addressSnapshot.district}, ${addressSnapshot.city}`,
              originCode: shippingDetails.originCode,
              weight: Number(shippingDetails.weight),
              isInsurance: useInsurance,
              insuranceAmount: insuranceCost,
              dimensions: shippingDetails.dimensions || {}
            }
          },

          items: {
            create: validatedItems.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtBuy: item.price,
              weightAtBuy: item.weight
            })),
          },
        },
      });

      await tx.orderHistory.create({
        data: { transactionId: transaction.id, status: "PENDING", notes: "Checkout berhasil, menunggu pembayaran." }
      });

      return { transaction, chargeRes, validatedItems };
    }, { timeout: 35000 }); // Ditambah dikit buat amannya Xendit

    const { transaction, validatedItems } = result;
    
    // 9. ASYNC NOTIFICATION
    sendInvoiceEmail(session.user?.email as string, {
      ...transaction,
      items: validatedItems, 
    }).catch(err => console.error("Email Error:", err));

    return res.status(200).json({
      invoice: transaction.invoice,
      qr_string: result.chargeRes.qr_string,
      qrUrl: result.transaction.midtransOrderId,
      amount: transaction.totalAmount,
      expiry_time: transaction.paymentExpiry
    });

  } catch (error: any) {
    console.error("CHARGE_CRITICAL_ERROR:", error);
    return res.status(400).json({ error: error.message || "Gagal memproses transaksi" });
  }
}