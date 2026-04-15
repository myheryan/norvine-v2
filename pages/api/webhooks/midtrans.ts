import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@/generated/prisma/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status
  } = req.body;

  try {
    // 1. Verifikasi Signature Key (CRITICAL: Midtrans sering kirim gross_amount dengan .00)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    
    // Pastikan gross_amount berupa string bulat tanpa desimal jika memang di DB kamu bulat
    // Beberapa kasus butuh: Number(gross_amount).toFixed(0) atau .toFixed(2)
    const formattedAmount = String(gross_amount); 
    
    const payload = `${order_id}${status_code}${formattedAmount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');

    if (hash !== signature_key) {
      console.error(`[MIDTRANS] Invalid Signature for Order: ${order_id}`);
      return res.status(401).json({ message: 'Invalid Signature' });
    }

    // 2. Mapping Status Midtrans ke OrderStatus Prisma (Sesuai keinginanmu tadi)
    let newStatus: OrderStatus;

    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        newStatus = (fraud_status === 'challenge') ? OrderStatus.PENDING : OrderStatus.PAID;
        break;
      case 'pending':
        newStatus = OrderStatus.PENDING;
        break;
      case 'deny':
      case 'cancel':
        newStatus = OrderStatus.CANCELLED;
        break;
      case 'expire':
        newStatus = OrderStatus.EXPIRED; // Gunakan status EXPIRED yang kamu buat
        break;
      default:
        newStatus = OrderStatus.PENDING;
    }

    // 3. Jalankan DB Transaction
    await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.transaction.findUnique({
        where: { invoice: order_id },
        include: { items: true }
      });

      if (!currentOrder) throw new Error("Order tidak ditemukan");

      // IDEMPOTENCY GUARD: Jangan proses jika status sudah final
      if (currentOrder.status === newStatus) return;
      if (['PAID', 'SHIPPED', 'COMPLETED'].includes(currentOrder.status) && newStatus === OrderStatus.EXPIRED) {
        return; // Jangan expire-kan pesanan yang sudah dibayar/dikirim
      }

      // A. Update Status Utama
      await tx.transaction.update({
        where: { invoice: order_id },
        data: { status: newStatus }
      });

      // B. Catat ke OrderHistory (Gunakan ID transaksi)
      await tx.orderHistory.create({
        data: {
          transactionId: currentOrder.id,
          status: newStatus,
          notes: `Midtrans: ${transaction_status} | Fraud: ${fraud_status || 'none'}`
        }
      });

      // C. LOGIKA STOK: BERKURANG (Hanya saat status berubah dari PENDING ke PAID)
      if (newStatus === OrderStatus.PAID && currentOrder.status === OrderStatus.PENDING) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } }
            });

            await tx.stockLog.create({
              data: {
                variantId: item.variantId,
                change: -item.quantity,
                reason: `Penjualan (Inv: ${order_id})`
              }
            });
          }
        }
      }
      
      // D. LOGIKA STOK: KEMBALI / RESTOCK (Saat EXPIRED atau CANCELLED)
      // Stok dikembalikan HANYA jika status sebelumnya adalah PAID (jarang terjadi) 
      // ATAU jika kamu pakai sistem "Potong Stok Saat Checkout"
const isFailedStatus = ([OrderStatus.EXPIRED, OrderStatus.CANCELLED] as OrderStatus[]).includes(newStatus);
      
      if (isFailedStatus && currentOrder.status === OrderStatus.PAID) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } }
            });
            
            await tx.stockLog.create({
              data: {
                variantId: item.variantId,
                change: item.quantity,
                reason: `Restock Otomatis (Inv: ${order_id} | Status: ${newStatus})`
              }
            });
          }
        }
      }
    });

    console.log(`[MIDTRANS] Success processing Order: ${order_id} to ${newStatus}`);
    return res.status(200).json({ status: 'OK' });

  } catch (error: any) {
    console.error("[MIDTRANS_WEBHOOK_ERROR]:", error.message);
    // Tetap kirim 200 agar Midtrans tidak kirim ulang terus menerus jika error bersifat logic
    return res.status(200).json({ status: 'Error', message: error.message });
  }
}