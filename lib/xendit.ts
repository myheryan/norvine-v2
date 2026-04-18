import axios from 'axios';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
// Pastikan ada titik dua (:) sebelum di-base64
const AUTH_HEADER = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');



const xenditClient = axios.create({
  baseURL: 'https://api.xendit.co',
  headers: {
    'Authorization': `Basic ${AUTH_HEADER}`,
    'Content-Type': 'application/json',
  },
});

export const xenditApi = {
  createQRCode: async (data: { externalId: string; amount: number }) => {
    try {
      // Pastikan URL memiliki protokol, jika tidak ada tambahkan http:// sebagai fallback

      const response = await xenditClient.post('/qr_codes', {
        external_id: data.externalId,
        type: 'DYNAMIC',
        currency: 'IDR',
        amount: Math.round(data.amount),
        // Hapus trailing slash jika ada agar URL tidak double slash
        callback_url: `https://norvine-v2.vercel.app/api/webhooks/xendit`,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ XENDIT REGEX ERROR:', error.response?.data);
      throw new Error("Format URL Callback tidak valid. Periksa pengaturan sistem.");
    }
  }
};