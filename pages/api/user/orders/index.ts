import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Sesuaikan path authOptions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // DEBUG: Cek apakah ID muncul di terminal
  console.log("SESSION DI ORDER API:", session?.user);

  // Next-auth terkadang menyimpan ID di session.user.id (lowercase) 
  // atau Anda harus memastikannya ada di callback session
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. ID User tidak ditemukan." });
  }

  try {
    const now = new Date();
    // Gunakan userId yang sudah dipastikan ada
    await prisma.transaction.updateMany({
      where: {
        userId: userId, 
        status: OrderStatus.PENDING,
        paymentExpiry: { lt: now },
      },
      data: { status: OrderStatus.EXPIRED },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        ...(req.query.status && req.query.status !== "ALL" ? { status: req.query.status as any } : {}),
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, thumbnailUrl: true } },
            variant: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Tambahkan header untuk mencegah caching 304 jika diperlukan saat debug
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat pesanan" });
  }
}