import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Pastikan path authOptions benar

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

    const userId = (session.user as any).id;

    const transaction = await prisma.transaction.findUnique({
      where: { 
        invoice: String(id), 
        userId: userId 
      },
      include: {
        // 1. Load Alamat Snapshot
        shippingAddress: true, 
        
        // 2. Load Data Pengiriman (Wajib untuk displayStatus & No Resi)
        shipment: true,

        // 3. Load Detail Item, Produk, dan Varian
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

        // 4. Load Riwayat Status (Logistik & Pembayaran)
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        },

        // 5. Load Permintaan Pembatalan (Cancellation)
        cancellationRequest: true,

        // 6. Load Permintaan Retur (Refund)
        refundRequest: true,
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    }

    // Double check keamanan (opsional karena findUnique sudah pakai userId)
    if (transaction.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }

    // Set Header untuk menghindari caching data status yang sensitif
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    return res.status(200).json(transaction);

  } catch (error) {
    console.error("FETCH_ORDER_DETAIL_ERROR:", error);
    return res.status(500).json({ error: "Gagal mengambil data pesanan." });
  }
}