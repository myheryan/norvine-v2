import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { PaymentStatus, ShipmentStatus } from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. ID User tidak ditemukan." });
  }

  try {
    const now = new Date();

    // 1. CARI PESANAN YANG SEHARUSNYA EXPIRED (Berdasarkan PaymentStatus)
    const expiredOrders = await prisma.transaction.findMany({
      where: {
        userId: userId,
        status: PaymentStatus.PENDING, // Menunggu pembayaran
        paymentExpiry: { lt: now },
      },
      select: { id: true },
    });

    // 2. PROSES UPDATE & CATAT HISTORY (Jika ada yang expired)
    if (expiredOrders.length > 0) {
      const expiredIds = expiredOrders.map((o) => o.id);

      await prisma.$transaction([
        // Update PaymentStatus ke EXPIRED
        prisma.transaction.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: PaymentStatus.EXPIRED },
        }),
        // Catat otomatis ke OrderHistory (History merekam ShipmentStatus)
        // Jika expired, biasanya status shipment tidak ada atau FAILED
        prisma.orderHistory.createMany({
          data: expiredIds.map((id) => ({
            transactionId: id,
            status: ShipmentStatus.FAILED, // Atau status logistik relevan lainnya
            notes: "Sistem: Waktu pembayaran habis (Expired)",
          })),
        }),
      ]);
    }

    // 3. AMBIL DATA TRANSAKSI UNTUK FRONTEND
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        // Filter sederhana berdasarkan PaymentStatus jika query dikirim
        ...(req.query.status && req.query.status !== "ALL" 
          ? { status: req.query.status as PaymentStatus } 
          : {}),
      },
      include: {
        shipment: true, // WAJIB: Agar displayStatus() di frontend bekerja
        cancellationRequest: true,
        refundRequest: true,
        items: {
          include: {
            product: { select: { name: true, thumbnailUrl: true } },
            variant: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }, // Lebih stabil menggunakan createdAt untuk urutan riwayat
    });

    // Menghindari caching agar data status selalu terbaru
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("ERROR_FETCH_ORDERS:", error);
    return res.status(500).json({ message: "Gagal memuat pesanan" });
  }
}