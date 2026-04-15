import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma"; // Pastikan path ini benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(id) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true,
          }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        },
        promo: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Error Fetching Order:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}