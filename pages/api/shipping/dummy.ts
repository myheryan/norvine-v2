// pages/api/shipping.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simulasi loading selama 1.5 detik agar animasi loading N kamu terlihat
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { destination, weight } = req.body;

  // SKENARIO 1: Simulasi Error jika destinasi mengandung kata "error" atau kosong
  if (!destination || destination.includes("LUAR NEGERI")) {
    return res.status(400).json({
      message: "Please provide valid credentials or area not covered",
      result: []
    });
  }

  // SKENARIO 2: Simulasi Data Berhasil (Dummy Lion Parcel)
  const dummyResponse = {
    origin: "KEBON JERUK, JAKARTA BARAT",
    destination: destination || "MEDAN PETISAH, MEDAN",
    commodity: "ABR036",
    weight: weight || 1,
    message: "Success",
    result: [
      {
        row: 1,
        service_type: "PACKAGE",
        product: "VIPPACK",
        estimasi_sla: "1 - 1 Hari",
        status: "ACTIVE",
        total_tariff: 86000,
      },
      {
        row: 2,
        service_type: "PACKAGE",
        product: "BOSSPACK",
        estimasi_sla: "1 - 2 Hari",
        status: "ACTIVE",
        total_tariff: 43000,
      },
      {
        row: 3,
        service_type: "PACKAGE",
        product: "REGPACK",
        estimasi_sla: "2 - 3 Hari",
        status: "ACTIVE",
        total_tariff: 36000,
      },
      {
        row: 4,
        service_type: "PACKAGE",
        product: "JAGOPACK",
        estimasi_sla: "2 - 5 Hari",
        status: "ACTIVE",
        total_tariff: 25000,
      },
      {
        row: 5,
        service_type: "PACKAGE",
        product: "BIGPACK",
        estimasi_sla: "4 - 7 Hari",
        status: "INACTIVE", // Simulasi layanan yang tidak bisa dipilih
        total_tariff: 55000,
      }
    ]
  };

  return res.status(200).json(dummyResponse);
}