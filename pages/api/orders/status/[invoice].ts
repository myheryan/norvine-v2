// pages/api/orders/status/[invoice].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma' // Pastikan path ke prisma client benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ambil [invoice] dari URL
  const { invoice } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!invoice || invoice === 'undefined') {
    return res.status(400).json({ message: 'Invoice ID is required' })
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(invoice) },
      select: { status: true }
    })

    if (!transaction) {
      // Kirim JSON 404, bukan biarkan Next.js kirim halaman HTML 404
      return res.status(404).json({ message: 'Order not found', status: 'NOT_FOUND' })
    }

    return res.status(200).json({ status: transaction.status })
  } catch (error) {
    console.error('Error checking status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}