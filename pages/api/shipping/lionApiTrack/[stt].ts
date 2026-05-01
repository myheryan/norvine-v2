import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

// WAJIB: Gunakan export default function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Validasi Method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. Ambil parameter [stt] dari query
  const { stt } = req.query;

  if (!stt || typeof stt !== "string") {
    return res.status(400).json({ error: "Nomor STT (AWB) tidak valid" });
  }

  try {
    const response = await fetch(
      `https://api-stg-middleware.thelionparcel.com/v3/stt/track?q=${stt}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic bGlvbnBhcmNlbDpsaW9ucGFyY2VsQDEyMw==", // Gunakan ENV jika untuk produksi
        },
      }
    );

    const data = await response.json();

    // Logika Sinkronisasi Status POD (Terkirim)
    if (data?.stts && data.stts.length > 0) {
      const sttData = data.stts[0];
      const latestStatus = sttData.history?.[sttData.history.length - 1];

      if (sttData.status_code === "POD" || latestStatus?.status_code === "POD") {
        await handlePodStatus(stt, sttData.recipient_name);
      }
    }

    // Berikan respon JSON
    return res.status(200).json(data);

  } catch (error) {
    console.error("Lion Parcel Tracking API Error:", error);
    return res.status(500).json({ error: "Gagal mengambil data dari Lion Parcel" });
  }
}

// Fungsi Helper (handlePodStatus)
async function handlePodStatus(stt: string, receiver: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { awbNumber: stt },
    select: { id: true, status: true }
  });

  if (!shipment || shipment.status === "DELIVERED") return;

  await prisma.shipment.update({
    where: { id: shipment.id },
    data: { status: "DELIVERED" }
  });
}