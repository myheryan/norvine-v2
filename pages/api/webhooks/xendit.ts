import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { PaymentStatus } from '@/generated/prisma/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // 1. Validasi Token Keamanan Xendit
  const xenditToken = req.headers['x-callback-token'];
  if (process.env.XENDIT_CALLBACK_TOKEN && xenditToken !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.error(`[XENDIT] Unauthorized Webhook Attempt`);
    return res.status(401).json({ message: 'Invalid Token' });
  }

  const payload = req.body;
  const { event, data } = payload;

  if (!data) return res.status(400).json({ message: 'No Data Received' });

  // Identifikasi Transaksi
  const xenditStatus = data.status; // SUCCEEDED, COMPLETED, EXPIRED, FAILED
  const externalId = data.reference_id || data.external_id; 
  const qrId = data.qr_id || data.id;

  try {
    // 2. Cari Transaksi berdasarkan Invoice atau QR ID
    const currentOrder = await prisma.transaction.findFirst({
      where: {
        OR: [
          { invoice: externalId },
          { midtransOrderId: qrId } // Field ini kita gunakan untuk menyimpan ID Xendit
        ]
      },
      include: { 
        items: true,
        shipment: true 
      }
    });

    if (!currentOrder) {
      console.error(`[XENDIT] Order Not Found: ${externalId || qrId}`);
      return res.status(200).json({ message: 'Order ignored' }); 
    }

    // Idempotency: Jangan proses jika status sudah PAID atau COMPLETED
    if (currentOrder.status === PaymentStatus.PAID ) {
      return res.status(200).json({ status: 'Already Processed' });
    }

    let newStatus: PaymentStatus = currentOrder.status;
    let finalNote = "";

    // 3. Pemetaan Status Xendit ke PaymentStatus Norvine
    if (xenditStatus === 'SUCCEEDED' || xenditStatus === 'COMPLETED') {
      newStatus = PaymentStatus.PAID;
      finalNote = `Pembayaran QRIS via ${data.payment_detail?.source || 'Xendit'} berhasil diterima.`;
    } 
    else if (xenditStatus === 'EXPIRED') {
      newStatus = PaymentStatus.EXPIRED;
      finalNote = "Batas waktu pembayaran habis.";
    } 
    else if (xenditStatus === 'FAILED') {
      newStatus = PaymentStatus.FAILED;
      finalNote = "Pembayaran QRIS gagal diproses.";
    }

    // Jika tidak ada perubahan status penting, stop di sini
    if (currentOrder.status === newStatus) {
      return res.status(200).json({ status: 'No Change' });
    }

    // 4. Eksekusi Database Transaction
    await prisma.$transaction(async (tx) => {
      
      // A. Update Status Utama Transaksi
      await tx.transaction.update({
        where: { id: currentOrder.id },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        }
      });



      // C. Catat di OrderHistory
      await tx.orderHistory.create({
        data: {
          transactionId: currentOrder.id,
          status: newStatus,
          notes: finalNote
        }
      });

      // Definisikan array-nya dengan tipe PaymentStatus[]
    const cancellationStatuses: PaymentStatus[] = [
      PaymentStatus.EXPIRED, 
      PaymentStatus.FAILED, 
      PaymentStatus.CANCELLED
    ];

    // Gunakan .includes tanpa error
    const isCancellation = cancellationStatuses.includes(newStatus);
          
      if (isCancellation) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            // Kembalikan Stok ke ProductVariant
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } }
            });

            // Catat di StockLog (RESTOCK)
            await tx.stockLog.create({
              data: {
                variantId: item.variantId,
                change: item.quantity,
                reason: `RESTOCK: ${xenditStatus} (Inv: ${currentOrder.invoice})`
              }
            });
          }
        }
      }

      // E. Logika Audit Stok (Jika Lunas)
      if (newStatus === PaymentStatus.PAID) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.stockLog.create({
              data: {
                variantId: item.variantId,
                change: 0, // Stok sudah dikurangi saat checkout (SALE), di sini hanya audit
                reason: `SALE_VERIFIED: Pembayaran Berhasil (Inv: ${currentOrder.invoice})`
              }
            });
          }
        }
      }
    });

    console.log(`[XENDIT] Webhook Success: ${currentOrder.invoice} -> ${newStatus}`);
    return res.status(200).json({ status: 'OK' });

  } catch (error: any) {
    console.error("[XENDIT_WEBHOOK_CRITICAL]:", error.message);
    // Kirim 200 agar Xendit tidak terus menerus retry jika error berasal dari logic kita
    return res.status(200).json({ status: 'Error Handled', message: error.message });
  }
}