import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Silakan login kembali." });
    }

    const userId = (session.user as any).id;
    const { invoice, reason } = req.body;

    if (!invoice || !reason) {
      return res.status(400).json({ error: "Invoice dan alasan wajib diisi." });
    }

    // 1. Cari transaksi berdasarkan invoice
    const transaction = await prisma.transaction.findUnique({
      where: { invoice },
      include: { refundRequest: true }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan." });
    }

    // 2. Keamanan: Pastikan user hanya bisa me-refund miliknya sendiri
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    // 3. Validasi: Jika sudah ada pengajuan (Unique constraint), hentikan
    if (transaction.refundRequest) {
      return res.status(400).json({ error: "Pengajuan pembatalan sudah diproses sebelumnya." });
    }

    // 4. Jalankan Prisma Transaction agar data konsisten
    const result = await prisma.$transaction(async (tx) => {
      // Buat data RefundRequest sesuai skema Bapak
      const refund = await tx.refundRequest.create({
        data: {
          transactionId: transaction.id,
          userId: userId, // Relasi ke User
          amount: transaction.totalAmount, // Nominal yang akan dikembalikan
          reason: reason,
          status: 'PENDING', // Default dari enum
        }
      });

      // Catat ke OrderHistory (Opsional, sangat disarankan untuk audit)
      await tx.orderHistory.create({
        data: {
          transactionId: transaction.id,
          status: transaction.status,
          notes: `Pengajuan (Refund). Alasan: ${reason}`,
        }
      });

      return refund;
    });

    return res.status(200).json({ 
      success: true, 
      message: "Permintaan pembatalan berhasil dikirim ke Admin.",
      data: result 
    });

  } catch (error) {
    console.error("Refund API Error:", error);
    return res.status(500).json({ error: "Gagal memproses pengajuan refund." });
  }
}