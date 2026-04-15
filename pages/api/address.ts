// pages/api/address-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, id } = req.query;

  // Pastikan type ada
  if (!type) {
    return res.status(400).json({ message: 'Missing type parameter' });
  }

  // Bangun URL dengan teliti, pastikan id bukan string "undefined" atau "null"
  let targetUrl = `https://maps.norvine.co.id/api/address?type=${type}`;
  if (id && id !== 'undefined' && id !== 'null' && id !== '') {
    targetUrl += `&id=${id}`;
  }

  try {
    console.log("--- PROXY START ---");
    console.log("Requesting to:", targetUrl);

    const response = await axios.get(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000 // 10 detik timeout
    });

    console.log("Server Norvine Response OK");
    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error("--- PROXY ERROR ---");
    
    if (error.response) {
      // Server Norvine merespon dengan status selain 2xx
      console.error("Norvine Status:", error.response.status);
      console.error("Norvine Data:", error.response.data);
      return res.status(error.response.status).json({
        message: 'Server Norvine menolak request',
        detail: error.response.data
      });
    } else if (error.request) {
      // Request terkirim tapi tidak ada respon (Timeout/DNS Issue)
      console.error("No Response from Norvine. Check internet connection.");
      return res.status(504).json({ message: 'Server Norvine tidak merespon (Timeout)' });
    } else {
      // Ada masalah saat setting request
      console.error("Axios Config Error:", error.message);
      return res.status(500).json({ message: 'Proxy internal error', error: error.message });
    }
  }
}