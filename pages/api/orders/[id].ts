// pages/api/orders/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Ini akan mengambil 'NORV-xxxx' dari URL

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Silakan login kembali." });
    }

    // Cari transaksi berdasarkan invoice (orderId)
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(id) },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    }

    // Pastikan user hanya bisa melihat pesanan miliknya sendiri
    const userId = (session.user as any).id;
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    return res.status(200).json({ transaction });

  } catch (error) {
    console.error("Fetch Order Error:", error);
    return res.status(500).json({ error: "Gagal mengambil data pesanan." });
  }
}