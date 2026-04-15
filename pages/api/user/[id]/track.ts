// pages/api/user/orders/[invoice]/track.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { invoice } = req.query;

  // Simulasi data tracking dari Database atau Kurir
  const trackingData = {
    invoice: invoice,
    courier: "Lion Parcel",
    waybill: "LP-987654321",
    status: "ON_PROCESS",
    history: [
      {
        
        date: "2026-04-05 10:00",
        location: "Gudang Pusat (Jakarta)",
        note: "Pesanan telah diterima oleh kurir dan sedang diproses."
      },
      {
        date: "2026-04-05 14:30",
        location: "Transit Hub (Bandung)",
        note: "Paket dalam perjalanan ke arah alamat tujuan."
      },
      {
        date: "2026-04-05 18:00",
        location: "Sortation Center (Ciamis)",
        note: "Paket telah sampai di pusat sortir lokal."
      }
    ]
  };

  // Kirim response
  return res.status(200).json(trackingData);
}