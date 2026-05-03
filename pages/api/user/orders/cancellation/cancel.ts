import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { PaymentStatus, ShipmentStatus } from '@/generated/prisma/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { invoice, reason } = req.body;

    // 1. Cari transaksi lengkap dengan status shipment
    const transaction = await prisma.transaction.findFirst({
      where: { invoice, userId },
      include: { 
        items: true,
        shipment: true,
        cancellationRequest: true 
      }
    });

    if (!transaction) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    if (transaction.cancellationRequest) return res.status(400).json({ error: "Permintaan pembatalan sudah diajukan" });

    // --- LOGIKA PEMBATALAN BERDASARKAN STATUS ---

    // KASUS A: Pesanan BELUM DIBAYAR (PENDING)
    // Langsung CANCEL otomatis dan kembalikan stok.
    if (transaction.status === PaymentStatus.PENDING) {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: PaymentStatus.CANCELLED }
        });

        // Restore stok
        for (const item of transaction.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } }
            });
            // Catat log stok
            await tx.stockLog.create({
              data: { variantId: item.variantId, change: item.quantity, reason: `CANCEL_AUTO: ${invoice}` }
            });
          }
        }

        await tx.orderHistory.create({
          data: {
            transactionId: transaction.id,
            status: "CANCELLED",
            notes: `Dibatalkan oleh pembeli. Alasan: ${reason}`
          }
        });
      });
      return res.status(200).json({ message: "Pesanan berhasil dibatalkan" });
    }

    // KASUS B: Pesanan SUDAH DIBAYAR (PAID)
    // Jika belum dikirim (Shipment masih PENDING/PROCESSING), buat Request ke Admin.
    if (transaction.status === PaymentStatus.PAID ) {
      if (transaction.shipment?.status === ShipmentStatus.READY_TO_SHIP || transaction.shipment?.status === ShipmentStatus.SHIPPED || transaction.shipment?.status === ShipmentStatus.DELIVERED) {
        return res.status(400).json({ error: "Pesanan sudah dikirim, tidak bisa dibatalkan." });
      }

      await prisma.$transaction(async (tx) => {
        // Buat permintaan pembatalan untuk ditinjau admin (Refund process)
        await tx.cancellationRequest.create({
          data: {
            transactionId: transaction.id,
            userId: userId,
            reason: reason,
            amount: transaction.totalAmount,
            status: "PENDING"
          }
        });

        await tx.orderHistory.create({
          data: {
            transactionId: transaction.id,
            status: "CANCELLATION_REQUESTED",
            notes: `Mengajukan pembatalan pesanan. Alasan: ${reason}`
          }
        });
      });

      return res.status(200).json({ message: "Permintaan pembatalan sedang ditinjau admin" });
    }

    return res.status(400).json({ error: "Status pesanan tidak memungkinkan untuk pembatalan" });

  } catch (error: any) {
    console.error("CANCEL_ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}