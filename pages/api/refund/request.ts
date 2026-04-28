import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PaymentStatus } from '@/generated/prisma/enums';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Silakan login ulang." });

    const { transactionId, reason, amount } = req.body;
    const userId = (session.user as any).id;

    // 1. Validasi Kepemilikan & Status (Wajib PAID)
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId, status: PaymentStatus.PAID }
    });

    if (!transaction) {
      throw new Error("Transaksi tidak valid atau belum memenuhi syarat refund.");
    }

    // 2. Cegah Pengajuan Ganda
    const existing = await prisma.refundRequest.findUnique({ where: { transactionId } });
    if (existing) throw new Error("Permintaan refund sudah dalam antrean admin.");

    // 3. Simpan ke Antrean RefundRequest
    const refund = await prisma.refundRequest.create({
      data: {
        transactionId,
        userId,
        amount: amount || transaction.totalAmount,
        reason: reason || "CUSTOMER_REQUEST",
        status: "PENDING"
      }
    });

    return res.status(200).json({ success: true, data: refund });

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}