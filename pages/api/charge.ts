import { NextApiRequest, NextApiResponse } from 'next';
import { coreApi } from '@/lib/midtrans';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { NORVINE_CONFIG } from '@/types/norvine-default';
import { sendInvoiceEmail } from '@/lib/email-template';

const PLATFORM_SERVICE_FEE = NORVINE_CONFIG.SERVICE_FEE;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Silakan login." });

    const { 
      orderId, paymentMethod, shippingService, 
      useInsurance, items, district, city, promoCode, address, recipientName, 
      recipientPhone, dimensions, notes,
      shippingDetails 
    } = req.body;

    const userId = (session.user as any).id;
    const shippingCost = shippingDetails?.cost || 0; // <--- DEFINISIKAN VARIABLE INI

        // Contoh logic pengecekan di API /api/charge
    const pendingOrder = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        status: "PENDING",
        paymentExpiry: {
          gt: new Date() // Masih dalam masa berlaku pembayaran
        }
      },
      select: { invoice: true }
    });

    if (pendingOrder) {
      throw new Error(`Anda masih memiliki pesanan pending #${pendingOrder.invoice}. Selesaikan pembayaran sebelum membuat pesanan baru.`);
    }

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

      // B. Validasi Promo (Tetap sama dengan logic Anda)
      let serverDiscount = 0;
      let promoId: number | null = null;
      if (promoCode) {
        const now = new Date();
        const promo = await tx.promo.findUnique({ where: { code: String(promoCode).toUpperCase() } });
        if (promo && promo.status === 'ACTIVE' && serverSubtotal >= (promo.minOrder || 0)) {
          promoId = promo.id;
          serverDiscount = promo.type === 'PERCENT' 
            ? Math.min(Math.floor((serverSubtotal * promo.value) / 100), promo.maxDiscount || Infinity)
            : promo.value;
          await tx.promo.update({ where: { id: promo.id }, data: { used: { increment: 1 } } });
        }
      }

      // C. Kalkulasi Final
      const finalSubtotal = serverSubtotal - serverDiscount;
      const insuranceCost = useInsurance ? Math.round(finalSubtotal * NORVINE_CONFIG.INSURANCE_RATE) : 0;
      const finalAmount = finalSubtotal + shippingCost + insuranceCost + PLATFORM_SERVICE_FEE;

      // D. Midtrans Charge (Tetap sama)
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
      const rawExpiry = chargeResponse.expiry_time; 

      for (const item of validatedItems) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
      }


      const transaction = await tx.transaction.create({
        data: {
          invoice: orderId,
          notes,
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
          paymentExpiry: rawExpiry ? new Date(rawExpiry.replace(" ", "T") + "+07:00") : null,
          rawPaymentRes: chargeResponse as any, 
          shipment: {
            create: {
              courierCode: shippingDetails.courier || "LION",
              courierService: shippingDetails.service || shippingService,
              destination: `${district}, ${city}`,
              originCode: shippingDetails.originCode,
              destinationCode: shippingDetails.destinationCode,
              ursaCode: shippingDetails.ursaCode,
              isInsurance: insuranceCost > 0, 
              insuranceAmount: insuranceCost || 0,
              weight: shippingDetails.totalWeight,              
              apiPayload: {
                dimensions: dimensions || { length: 10, width: 10, height: 10 },
              }
            }
          },
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

      // G. Buat History
      await tx.orderHistory.create({
        data: {
          transactionId: transaction.id,
          status: "PENDING",
          notes: "Menunggu pembayaran."
        }
      });

      return { transaction, validatedItems };
    }, {
      timeout: 15000 
    });

    const { transaction, validatedItems } = result;
    
    sendInvoiceEmail(session.user?.email as string, {
      ...transaction,
      items: validatedItems, // Kita pakai validatedItems karena sudah ada field 'name' produk
    }).catch(err => console.error("Gagal kirim email invoice:", err));

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("CHARGE ERROR:", error.message);
    return res.status(400).json({ error: error.message });
  }
}