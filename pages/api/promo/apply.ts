import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const applyPromoSchema = z.object({
  code: z.string().min(1, { message: "Kode promo tidak boleh kosong" }),
  subtotal: z.number().positive({ message: "Subtotal harus berupa angka positif" }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const validation = applyPromoSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: validation.error.issues[0].message 
      });
    }

    const { code, subtotal } = validation.data;

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() }
    });

    // 1. Validasi Keberadaan & Status
    if (!promo) {
      return res.status(404).json({ success: false, message: "Kode promo tidak ditemukan" });
    }

    if (promo.status !== "ACTIVE") {
      return res.status(400).json({ success: false, message: "Kode promo sudah tidak aktif" });
    }

    // 2. Validasi Kuota
    if (promo.used >= promo.limit) {
      return res.status(400).json({ success: false, message: "Kuota promo sudah habis" });
    }

    // 3. Validasi Minimum Belanja (PENTING!)
    // Pastikan field minOrder ada di schema. Jika tidak ada, hapus baris ini.
    const minOrder = (promo as any).minOrder || 0;
    if (subtotal < minOrder) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimal belanja Rp ${minOrder.toLocaleString('id-ID')} untuk menggunakan promo ini.` 
      });
    }

    let discountAmount = 0;

    // 4. Kalkulasi Diskon dengan Max Discount Logic
    if (promo.type === "FIXED") {
      discountAmount = promo.value;
    } else if (promo.type === "PERCENT") {
      discountAmount = (subtotal * promo.value) / 100;
      
      // Terapkan plafon diskon jika ada maxDiscount di database
      const maxDiscount = (promo as any).maxDiscount;
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    }

    // Keamanan: Diskon tidak boleh lebih besar dari harga barang
    if (discountAmount > subtotal) discountAmount = subtotal;

    return res.status(200).json({
      success: true,
      message: `Berhasil menggunakan promo: ${promo.name}`,
      discountAmount: Math.floor(discountAmount), // Bulatkan ke bawah agar tidak ada desimal di rupiah
      promoCode: promo.code,
      promoName: promo.name
    });

  } catch (error) {
    console.error("Promo Error:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
}