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

    const transaction = await prisma.transaction.findFirst({
      where: { invoice, userId }
    });

    if (!transaction) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

    // Tetap catat di Order History sebagai bukti audit di Admin Panel
    await prisma.orderHistory.create({
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        notes: `USER KLIK KOMPLAIN (WA): ${reason}`
      }
    });

    // Kirim respon sukses agar Client bisa lanjut redirect ke WA
    return res.status(200).json({ 
      success: true, 
      message: "Komplain tercatat, mengalihkan ke WhatsApp..." 
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}