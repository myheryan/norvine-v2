import { NORVINE_CONFIG } from '@/types/norvine-default'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { destination, weight, length, width, height } = req.body

  try {
    // 1. Ambil data gudang default dari database
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        isDefault: true // Mengambil gudang utama
      }
    })

    // Fallback: Jika tidak ada default, ambil gudang apa saja yang tersedia
    const activeWarehouse = warehouse || await prisma.warehouse.findFirst();

    if (!activeWarehouse || !activeWarehouse.lionOriginCode) {
      return res.status(404).json({ 
        message: 'Origin code (lionOriginCode) tidak ditemukan di tabel warehouse.' 
      })
    }

    const baseUrl = "https://api-stg-middleware.thelionparcel.com/v3/tariff"
    
    // 2. Susun parameter dengan data dari database
    const params = new URLSearchParams({
      origin: `${activeWarehouse.district}, ${activeWarehouse.city}` || activeWarehouse.lionOriginCode, // Menggunakan lionOriginCode dari model
      destination: destination,
      weight: weight.toString(),
      commodity: process.env.NORVINE_CODE_COMODITY_TYPE || "CLOTHES",
      length: (length || NORVINE_CONFIG.DEFAULT_DIMENSIONS.length).toString(),
      width: (width || NORVINE_CONFIG.DEFAULT_DIMENSIONS.width).toString(),
      height: (height || NORVINE_CONFIG.DEFAULT_DIMENSIONS.height).toString()
    })

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic bGlvbnBhcmNlbDpsaW9ucGFyY2VsQDEyMw==',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    // Tambahkan info gudang pengirim di respon jika diperlukan untuk UI
    return res.status(200).json({
      ...data,
      shippedFrom: activeWarehouse.name
    })

  } catch (error) {
    console.error("Logistics Tariff Error:", error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}