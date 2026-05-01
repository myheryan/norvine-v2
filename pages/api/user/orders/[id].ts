import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]'; 

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

    // Pastikan pengambilan ID user sesuai dengan konfigurasi session Anda
    const userId = (session.user as any).id;

    const transaction = await prisma.transaction.findUnique({
      where: { 
        // Menggunakan invoice sebagai identifier unik
        invoice: String(id), 
      },
      include: {
        shippingAddress: true, 
        shipment: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                thumbnailUrl: true,
              }
            },
            variant: {
              select: {
                name: true
              }
            },
          }
        },
        // Pastikan nama field di schema Prisma adalah 'history'
        // Jika di schema namanya 'orderHistory', ubah menjadi orderHistory
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        cancellationRequest: true,
        refundRequest: true,
      }
    });

    // 1. Cek keberadaan transaksi
    if (!transaction) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    }

    // 2. Keamanan: Pastikan transaksi ini milik user yang sedang login
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak. Anda tidak memiliki izin untuk melihat pesanan ini." });
    }

    // 3. Tambahkan header untuk memastikan data selalu fresh (Penting untuk status tracking)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json(transaction);

  } catch (error) {
    console.error("FETCH_ORDER_DETAIL_ERROR:", error);
    return res.status(500).json({ error: "Gagal mengambil data pesanan secara internal." });
  }
}