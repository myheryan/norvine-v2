import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { invoice } = req.query;

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

    // Ambil data transaksi beserta history-nya
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(invoice) },
      include: {
        history: {
          orderBy: {
            createdAt: 'desc' // Riwayat terbaru di atas
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Data history tidak ditemukan" });
    }

    // Mapping agar formatnya sesuai dengan kebutuhan UI TrackingModal
    const formattedHistory = transaction.history.map((h) => ({
      date: new Date(h.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date(h.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status_description: h.notes || h.status,
    }));

    return res.status(200).json({
      invoice: transaction.invoice,
      history: formattedHistory
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}