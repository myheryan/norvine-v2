import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

    const { invoice, reason } = req.body;
    const userId = (session.user as any).id;

    // 1. Cari transaksi
    const transaction = await prisma.transaction.findFirst({
      where: { invoice, userId },
      include: { items: true }
    });

    if (!transaction) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    if (transaction.status !== 'PENDING' && transaction.status !== 'PROCESSING') {
      return res.status(400).json({ error: "Hanya pesanan pending yang bisa dibatalkan" });
    }

    // 2. Jalankan Transaction Database (Update Status & Restore Stok)
    await prisma.$transaction(async (tx) => {
      // Update status transaksi
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'CANCELLED' }
      });

      // Restore stok untuk setiap item
      for (const item of transaction.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      // Catat ke History
      await tx.orderHistory.create({
        data: {
          transactionId: transaction.id,
          status: 'CANCELLED',
          notes: `Dibatalkan oleh pembeli. Alasan: ${reason}`
        }
      });
    });

    return res.status(200).json({ message: "Pesanan berhasil dibatalkan" });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}