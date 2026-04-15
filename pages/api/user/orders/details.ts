import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Batasi hanya untuk Method GET
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 2. Paksa No-Cache agar status pembayaran selalu Update (Anti-304)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { invoice } = req.query;

  // 3. Validasi invoice agar tidak mencari string "undefined"
  if (!invoice || typeof invoice !== "string") {
    return res.status(400).json({ message: "Invoice ID diperlukan" });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: invoice },
      include: { 
        items: { 
          include: { product: true } 
        },
        promo: true // Tambahkan ini jika kamu ingin menampilkan potongan promo di detail
      }
    });

    // 4. Cek kepemilikan transaksi
    if (!transaction || transaction.userId !== (session.user as any).id) {
      return res.status(404).json({ message: "Order tidak ditemukan atau akses ditolak" });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Order Detail Error:", error);
    return res.status(500).json({ message: "Gagal mengambil data transaksi" });
  }
}