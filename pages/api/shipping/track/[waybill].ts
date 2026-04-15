// pages/api/shipping/track/[waybill].ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { waybill } = req.query;
  const API_KEY = process.env.LION_PARCEL_API_KEY;

  try {
    const response = await fetch(`https://api-tracking.lionparcel.com/v1/track?stt=${waybill}`, {
      headers: {
        'X-API-KEY': API_KEY || '',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data tracking" });
  }
}