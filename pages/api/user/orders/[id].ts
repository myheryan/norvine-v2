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

    const userId = (session.user as any).id;

    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(id) },
      include: {
        user: true, 
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
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        cancellationRequest: true,
        refundRequest: true,
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ error: "Akses ditolak." });
    }


    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json(transaction);

  } catch (error) {
    console.error("FETCH_ORDER_DETAIL_ERROR:", error);
    return res.status(500).json({ error: "Gagal mengambil data pesanan." });
  }
}