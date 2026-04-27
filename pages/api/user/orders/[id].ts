import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; 

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Silakan login kembali." });
    }

    // Ambil ID User dari session
    const userId = (session.user as any).id;

    // Cari transaksi berdasarkan invoice
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(id) },
      include: {
        // PERBAIKAN: Tambahkan shippingAddress agar alamat muncul
        shippingAddress: true, 
        
        // Load items beserta detail produk & variannya
        items: {
          include: {
            product: true,
            variant: true,
          }
        },

        // Load history untuk log status (diurutkan dari yang terbaru)
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        },

        // Load data refund jika ada (untuk tombol rincian pengembalian)
        refundRequest: true,
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    }

    // Keamanan: Pastikan user hanya bisa melihat pesanan miliknya sendiri
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    // Kirim data ke frontend
    return res.status(200).json(transaction);

  } catch (error) {
    console.error("Fetch Order Error:", error);
    return res.status(500).json({ error: "Gagal mengambil data pesanan." });
  }
}