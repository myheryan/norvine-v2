import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";
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

    // 1. CARI PESANAN YANG SEHARUSNYA EXPIRED
    const expiredOrders = await prisma.transaction.findMany({
      where: {
        userId: userId,
        status: OrderStatus.PENDING,
        paymentExpiry: { lt: now },
      },
      select: { id: true },
    });

    // 2. PROSES UPDATE & CATAT HISTORY (Jika ada yang expired)
    if (expiredOrders.length > 0) {
      const expiredIds = expiredOrders.map((o) => o.id);

      await prisma.$transaction([
        // Update status ke EXPIRED
        prisma.transaction.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: OrderStatus.EXPIRED },
        }),
        // Catat otomatis ke OrderHistory
        prisma.orderHistory.createMany({
          data: expiredIds.map((id) => ({
            transactionId: id,
            status: OrderStatus.EXPIRED,
            notes: "Dibatalkan otomatis oleh sistem (Waktu pembayaran habis)",
            // updatedById dikosongkan karena sistem yang membatalkan
          })),
        }),
      ]);
    }

    // 3. AMBIL DATA TRANSAKSI UNTUK FRONTEND
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        ...(req.query.status && req.query.status !== "ALL" ? { status: req.query.status as any } : {}),
      },
      include: {
        cancellationRequest: true,
        refundRequest: true,
        items: {
          include: {
            product: { select: { name: true, thumbnailUrl: true } },
            variant: { select: { name: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }, 
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("ERROR_FETCH_ORDERS:", error);
    return res.status(500).json({ message: "Gagal memuat pesanan" });
  }
}