
import { NORVINE_CONFIG } from '@/types/norvine-default'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { destination, weight, length, width, height } = req.body
  const baseUrl = "https://api-stg-middleware.thelionparcel.com/v3/tariff"
  
  const params = new URLSearchParams({
    origin: process.env.NORVINE_ADDRESS_CORPORATE, // Alamat kantor Anda
    destination: destination,
    weight: weight.toString(),
    commodity: process.env.NORVINE_CODE_COMODITY_TYPE,
    length: length || NORVINE_CONFIG.DEFAULT_DIMENSIONS.length,
    width: width || NORVINE_CONFIG.DEFAULT_DIMENSIONS.width,
    height: height || NORVINE_CONFIG.DEFAULT_DIMENSIONS.height
  })

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic bGlvbnBhcmNlbDpsaW9ucGFyY2VsQDEyMw==',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}





