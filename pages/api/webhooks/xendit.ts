import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { OrderStatus } from '@/generated/prisma/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Validasi Token Keamanan Xendit
  const xenditToken = req.headers['x-callback-token'];
  if (process.env.XENDIT_CALLBACK_TOKEN && xenditToken !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.error(`[XENDIT] Unauthorized Webhook Attempt`);
    return res.status(401).json({ message: 'Invalid Token' });
  }

  const body = req.body;
  const { status, qr_id, amount, external_id } = body;

  try {
    // Cari transaksi berdasarkan QR ID (Xendit) atau Invoice (External ID)
    // Kita simpan QR ID di midtransOrderId sebelumnya
    const currentOrder = await prisma.transaction.findFirst({
      where: {
        OR: [
          { midtransOrderId: qr_id || body.qr_code?.id },
          { invoice: external_id }
        ]
      },
      include: { items: true }
    });

    if (!currentOrder) {
      console.error(`[XENDIT] Order not found for ID: ${qr_id || external_id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    let newStatus: OrderStatus = currentOrder.status;
    let finalNote = "";

    // 2. Pemetaan Status Xendit ke OrderStatus Norvine
    if (status === 'COMPLETED' || status === 'SUCCEEDED') {
      newStatus = OrderStatus.PAID;
      finalNote = `Pembayaran QRIS Xendit berhasil diterima sebesar Rp ${amount.toLocaleString('id-ID')}.`;
    } else if (status === 'EXPIRED') {
      newStatus = OrderStatus.EXPIRED;
      finalNote = "Batas waktu pembayaran QRIS habis. Pesanan dibatalkan otomatis.";
    } else if (status === 'FAILED') {
      newStatus = OrderStatus.CANCELLED;
      finalNote = "Pembayaran QRIS gagal.";
    }

    // Jika status tidak berubah, selesaikan
    if (currentOrder.status === newStatus) {
      return res.status(200).json({ status: 'No Change' });
    }

    // 3. Eksekusi Database Transaction (Logika Stok sama dengan Midtrans)
    await prisma.$transaction(async (tx) => {
      // Update Status Transaksi
      await tx.transaction.update({
        where: { id: currentOrder.id },
        data: { status: newStatus }
      });

      // Catat di History
      await tx.orderHistory.create({
        data: {
          transactionId: currentOrder.id,
          status: newStatus,
          notes: finalNote
        }
      });

      // LOGIKA STOK: BERKURANG (Jika dari PENDING ke PAID)
      // Note: Di checkout.ts stok sudah dikurangi, tapi ini sebagai fail-safe 
      // atau jika Anda mengubah alur stok hanya berkurang saat PAID.
      if (newStatus === OrderStatus.PAID && currentOrder.status === OrderStatus.PENDING) {
        // (Opsional) Jika di checkout.ts sudah kurangi stok, bagian ini bisa di-skip
        // Tapi jika ingin sinkron dengan webhook Midtrans Anda:
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.stockLog.create({
              data: {
                variantId: item.variantId,
                change: -item.quantity,
                reason: `Pembayaran Terverifikasi Xendit (Inv: ${currentOrder.invoice})`
              }
            });
          }
        }
      }

      // LOGIKA STOK: KEMBALI (RESTOCK) jika EXPIRED atau CANCELLED
      const isRestock = ([OrderStatus.EXPIRED, OrderStatus.CANCELLED] as OrderStatus[]).includes(newStatus);
      if (isRestock) {
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
                reason: `Restock Otomatis - Xendit ${status} (Inv: ${currentOrder.invoice})`
              }
            });
          }
        }
      }
    });

    console.log(`[XENDIT] Success processing Order: ${currentOrder.invoice} to ${newStatus}`);
    return res.status(200).json({ status: 'OK' });

  } catch (error: any) {
    console.error("[XENDIT_WEBHOOK_ERROR]:", error.message);
    // Tetap kirim 200 agar Xendit tidak terus menerus kirim ulang jika errornya dari server kita
    return res.status(200).json({ status: 'Error', message: error.message });
  }
}