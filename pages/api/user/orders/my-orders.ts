import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Cek Session (Keamanan)
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "Unauthorized. Silakan login." });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 2. Ambil ID User dari session
    const userId = (session.user as any).id;

    // 3. Query database pake Prisma
    const orders = await prisma.transaction.findMany({
      where: {
        userId: userId, // Pastikan userId di DB tipe String (cuid)
      },
      include: {
        items: {
          include: {
            product: true, // Ambil info nama & image produk
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Urutkan dari yang terbaru
      },
    });

    // 4. Kirim respon JSON
    return res.status(200).json(orders);

  } catch (error: any) {
    console.error("API_MY_ORDERS_ERROR:", error);
    return res.status(500).json({ message: "Gagal mengambil data pesanan" });
  }
}