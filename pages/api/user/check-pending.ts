import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ hasPending: false });

    const userId = (session.user as any).id;

    // Cari transaksi PENDING yang paymentExpiry-nya masih di masa depan
    const pendingOrder = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        status: "PENDING",
        // Hanya blokir jika masa berlaku bayar belum lewat (expiry > sekarang)
        paymentExpiry: {
          gt: new Date() 
        }
      },
      select: {
        invoice: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (pendingOrder) {
      return res.status(200).json({ 
        hasPending: true, 
        invoice: pendingOrder.invoice 
      });
    }

    return res.status(200).json({ hasPending: false });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}