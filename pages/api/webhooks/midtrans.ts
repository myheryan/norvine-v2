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
    // 1. Verifikasi Signature Key (Gunakan .toFixed(0) agar konsisten dengan payload Midtrans)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const formattedAmount = Number(gross_amount).toFixed(0); 
    
    const payload = `${order_id}${status_code}${formattedAmount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');

    if (hash !== signature_key) {
      console.error(`[MIDTRANS] Invalid Signature for Order: ${order_id}`);
      return res.status(401).json({ message: 'Invalid Signature' });
    }

    // 2. Marketplace Notes Dictionary
    const statusNotes: Record<string, string> = {
      settlement: "Pembayaran berhasil diverifikasi. Pesanan kamu sedang diproses.",
      capture_accept: "Pembayaran kartu kredit berhasil diterima. Pesanan sedang diproses.",
      capture_challenge: "Pembayaran sedang ditinjau oleh sistem keamanan Midtrans.",
      pending: "Menunggu pembayaran dari pelanggan.",
      deny: "Pembayaran ditolak. Silakan coba lagi dengan metode lain.",
      cancel: "Pesanan telah dibatalkan.",
      expire: "Batas waktu pembayaran habis. Pesanan otomatis dibatalkan oleh sistem.",
      refund: "Dana telah dikembalikan ke pelanggan. Proses refund selesai.",
      partial_refund: "Sebagian dana telah dikembalikan ke pelanggan.",
    };

    // Tentukan kunci untuk mengambil pesan riwayat
    let noteKey = transaction_status;
    if (transaction_status === 'capture') noteKey = `capture_${fraud_status}`;
    const finalNote = statusNotes[noteKey] || `Status transaksi: ${transaction_status}`;

    // 3. Mapping Status Midtrans ke OrderStatus Prisma
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
        newStatus = OrderStatus.EXPIRED;
        break;
      case 'refund':
      case 'partial_refund':
        newStatus = OrderStatus.CANCELLED; // Bisa diganti OrderStatus.REFUNDED jika ada
        break;
      default:
        newStatus = OrderStatus.PENDING;
    }

    // 4. Jalankan DB Transaction
    await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.transaction.findUnique({
        where: { invoice: order_id },
        include: { items: true }
      });

      if (!currentOrder) throw new Error("Order tidak ditemukan");

      // IDEMPOTENCY GUARD
      if (currentOrder.status === newStatus) return;
      if (['PAID', 'SHIPPED', 'COMPLETED'].includes(currentOrder.status) && 
         (newStatus === OrderStatus.EXPIRED || newStatus === OrderStatus.CANCELLED)) {
        return; 
      }

      // A. Update Status Utama
      await tx.transaction.update({
        where: { invoice: order_id },
        data: { status: newStatus }
      });

      // B. Catat ke OrderHistory dengan Pesan Marketplace
      await tx.orderHistory.create({
        data: {
          transactionId: currentOrder.id,
          status: newStatus,
          notes: finalNote
        }
      });

      // C. LOGIKA STOK: BERKURANG (Hanya saat status berubah ke PAID)
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
      
      // D. LOGIKA STOK: KEMBALI (Saat EXPIRED, CANCELLED, atau REFUND)
      const isFailedStatus = ([OrderStatus.EXPIRED, OrderStatus.CANCELLED] as OrderStatus[]).includes(newStatus) || 
                             ['refund', 'partial_refund'].includes(transaction_status);
      
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
                reason: `Restock Otomatis (Inv: ${order_id} | Status: ${transaction_status})`
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
    return res.status(200).json({ status: 'Error', message: error.message });
  }
}