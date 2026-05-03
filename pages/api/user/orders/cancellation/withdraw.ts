import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ActionStatus } from '@/generated/prisma/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { transactionId } = req.body;

  if (!transactionId) return res.status(400).json({ message: 'Transaction ID is required' });

  try {
    // 1. Cari request pembatalan yang statusnya masih PENDING
    const cancelReq = await prisma.cancellationRequest.findFirst({
      where: {
        transactionId: transactionId,
        userId: session.user.id,
        status: ActionStatus.PENDING, // Hanya bisa ditarik jika belum diproses admin
      },
    });

    if (!cancelReq) {
      return res.status(404).json({ 
        message: 'Pengajuan tidak ditemukan atau sudah diproses admin.' 
      });
    }

    // 2. Hapus request pembatalan tersebut
    await prisma.cancellationRequest.delete({
      where: { id: cancelReq.id },
    });

    // 3. Tambahkan catatan di OrderHistory agar admin tahu user membatalkan pengajuannya
    await prisma.orderHistory.create({
      data: {
        transactionId: transactionId,
        status: "PAID", // Kembalikan label status history ke PAID
        notes: "User menarik kembali (withdraw) pengajuan pembatalan.",
      },
    });

    return res.status(200).json({ message: 'Request successfully withdrawn' });
  } catch (error: any) {
    console.error("[WITHDRAW_CANCEL_ERROR]:", error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}