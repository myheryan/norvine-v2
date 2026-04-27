import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { OrderStatus, ActionStatus } from "@/generated/prisma/enums";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Cek Autentikasi
  const session = await getServerSession(req, res, authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Silakan login kembali." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { invoice, reason } = req.body;

  if (!invoice || !reason) {
    return res.status(400).json({ message: "Data tidak lengkap (Invoice/Alasan)." });
  }

  try {
    // 2. Cari Transaksi & Validasi Kepemilikan
    const transaction = await prisma.transaction.findUnique({
      where: { invoice },
      include: { cancellationRequest: true },
    });

    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    const allowedStatus: OrderStatus[] = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.READY_TO_SHIP
    ];

    if (!allowedStatus.includes(transaction.status)) {
    return res.status(400).json({ 
        message: "Pesanan ini tidak dapat dibatalkan melalui pengajuan dana." 
    });
    }

    // 4. Cek apakah sudah pernah mengajukan sebelumnya
    if (transaction.cancellationRequest) {
      return res.status(400).json({ message: "Permintaan pembatalan sudah dikirim sebelumnya." });
    }

    // 5. Jalankan Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // A. Buat record di CancellationRequest
      const request = await tx.cancellationRequest.create({
        data: {
          transactionId: transaction.id,
          userId: userId,
          reason: reason,
          amount: transaction.totalAmount,
          status: ActionStatus.PENDING,
        },
      });

      // B. Catat di OrderHistory sebagai log audit
      await tx.orderHistory.create({
        data: {
          transactionId: transaction.id,
          status: transaction.status,
          notes: `USER_CANCEL_REQUEST: ${reason}`,
          updatedById: userId,
        },
      });

      // C. Update Transaction's updatedAt agar naik ke posisi teratas di list (orderBy updatedAt)
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { updatedAt: new Date() }
      });

      return request;
    });

    return res.status(200).json({
      message: "Permintaan pembatalan berhasil dikirim. Menunggu persetujuan admin.",
      data: result,
    });

  } catch (error) {
    console.error("API_CANCEL_REQUEST_ERROR:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}