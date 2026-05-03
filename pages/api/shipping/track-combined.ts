import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { invoice, waybill } = req.query;

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    // 1. Validasi Sesi (Opsional, tergantung kebijakan privasi Anda)
    // const session = await getServerSession(req, res, authOptions);
    // if (!session) return res.status(401).json({ error: "Unauthorized" });

    // 2. Ambil Data Internal (Order History)
    const transaction = await prisma.transaction.findUnique({
      where: { invoice: String(invoice) },
      include: {
        history: { orderBy: { createdAt: 'desc' } },
        shipment: true // Untuk mendapatkan AWB jika tidak dikirim via query
      }
    });

    if (!transaction) return res.status(404).json({ error: "Transaksi tidak ditemukan" });

    const stt = waybill || transaction.shipment?.awbNumber;
    let externalData: any = null;
    let combinedHistory: any[] = [];

    // 3. Ambil Data Eksternal (Lion Parcel) Jika Resi Ada
    if (stt) {
      try {
        const lpRes = await fetch(
          `https://api-stg-middleware.thelionparcel.com/v3/stt/track?q=${stt}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Basic bGlvbnBhcmNlbDpsaW9ucGFyY2VsQDEyMw==",
            },
          }
        );
        const lpJson = await lpRes.json();
        
        if (lpJson?.stts && lpJson.stts.length > 0) {
          externalData = lpJson.stts[0];
          
          // Jalankan Logika Sinkronisasi POD & Adjustment di Background
          // Kita tidak menggunakan 'await' di sini agar API cepat merespon
          syncLogistics(stt, externalData).catch(err => console.error("Sync Error:", err));
        }
      } catch (err) {
        console.error("Lion Parcel API Error:", err);
      }
    }

    // 4. Mapping History Internal
    const internalHistory = transaction.history.map((h) => ({
      id: h.id,
      notes: h.notes || `Status: ${h.status}`,
      createdAt: h.createdAt,
      location: "Gudang Norvine",

      isInternal: true
    }));

    // 5. Mapping History Eksternal
    const logisticsHistory = externalData?.history?.map((h: any, i: number) => ({
      id: `lp-${i}`,
      notes: h.remarks,
      createdAt: new Date(h.datetime),
      location: h.city,
      isInternal: false,
      courierCode: h.courierCode,
      courierService: h.courierService,
      attachment: h.attachment || [] // Foto POD jika ada
    })) || [];

    // 6. Gabungkan & Urutkan Berdasarkan Waktu Terbaru
    combinedHistory = [...internalHistory, ...logisticsHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 7. Response Akhir Sesuai TrackingModal
    return res.status(200).json({
      invoice: transaction.invoice,
      waybill: stt,
      current_status: externalData?.current_status === 'POD' ? 'Pesanan diterima' : externalData?.current_status,
      current_location: externalData?.history?.[0]?.city || "Norvine HQ",
      courier_name: externalData?.history?.find((h: any) => h.courier_name)?.courier_name || "Sistem Norvine",
      courierCode:  externalData?.product_type,
      courierService: externalData?.product_type,
      history: combinedHistory,
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}


async function syncLogistics(stt: any, sttData: any) {
  const history = sttData.history || [];
  const latestStatus = history[0]; // Biasanya index 0 di Lion Parcel adalah yang terbaru

  // 1. LOGIKA POD (DELIVERED)
  if (sttData.status_code === "POD" || latestStatus?.status_code === "POD") {
    const shipment = await prisma.shipment.findUnique({
      where: { awbNumber: stt },
      select: { id: true, status: true }
    });
    if (shipment && shipment.status !== "DELIVERED") {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: { status: "DELIVERED" }
      });
    }
  }

  // 2. LOGIKA STT ADJUSTED (Transparansi)
  const adjustmentLog = history.find((h: any) => h.status_code === "STT ADJUSTED");
  if (adjustmentLog) {
    const shipment = await prisma.shipment.findUnique({
      where: { awbNumber: stt },
      include: { transaction: true }
    });

    if (shipment && shipment.transaction) {
      const newWeight = adjustmentLog.chargeable_weight;
      const newCost = adjustmentLog.total_tariff;

      // Cek apakah sudah pernah dicatat di ShipmentAdjustment agar tidak duplikat
      const existingAdj = await prisma.shipmentAdjustment.findFirst({
        where: { shipmentId: shipment.id, newWeight: newWeight }
      });

      if (!existingAdj && (shipment.weight !== newWeight || shipment.transaction.shippingCost !== newCost)) {
        await prisma.shipmentAdjustment.create({
          data: {
            shipmentId: shipment.id,
            oldWeight: shipment.weight,
            newWeight: newWeight,
            oldShippingCost: shipment.transaction.shippingCost,
            newShippingCost: newCost,
            reason: adjustmentLog.remarks || "Penyesuaian otomatis dari Lion Parcel",
          }
        });
      }
    }
  }
}