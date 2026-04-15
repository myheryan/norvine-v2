import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // Sesuaikan path config auth lu

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { code, cartItems } = req.query;
    const session = await getServerSession(req, res, authOptions);
    const now = new Date();

    if (code) {
      const promo = await prisma.promo.findUnique({
        where: { code: String(code).toUpperCase() },
        include: { applicableProducts: { select: { id: true } } }
      });

      // 1. Validasi Keberadaan & Status
      if (!promo) return res.status(404).json({ success: false, message: "Voucher tidak ditemukan" });
      if (promo.status !== "ACTIVE") return res.status(400).json({ success: false, message: "Voucher tidak aktif" });
      
      // 2. Validasi Kuota Global
      if (promo.used >= promo.limit) return res.status(400).json({ success: false, message: "Kuota promo sudah habis" });
      
      // 3. Validasi Tanggal
      if (promo.startDate && new Date(promo.startDate) > now) return res.status(400).json({ success: false, message: "Promo belum dimulai" });
      if (promo.endDate && new Date(promo.endDate) < now) return res.status(400).json({ success: false, message: "Voucher kedaluwarsa" });

      // 4. Validasi 1x Pakai Per User (LOGIC ENTERPRISE)
      if (session?.user?.id) {
        const alreadyUsed = await prisma.transaction.findFirst({
          where: {
            userId: session.user.id,
            promoId: promo.id,
            status: { notIn: ['CANCELLED', 'EXPIRED'] } // Kalau transaksi gagal/cancel, boleh pakai lagi
          }
        });
        if (alreadyUsed) return res.status(400).json({ success: false, message: "Kamu sudah pernah menggunakan promo ini" });
      }

      // 5. Validasi Spesifik Produk & Harga (SECURITY)
      const parsedCart = JSON.parse(String(cartItems || '[]'));
      const productIdsInCart = parsedCart.map((item: any) => item.productId).filter(Boolean);
      
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIdsInCart } },
        select: { id: true, variants: { select: { price: true }, take: 1 } }
      });

      let totalSecureSubtotal = 0;
      let eligiblePromoSubtotal = 0;
      const allowedIds = promo.applicableProducts.map(p => p.id);

      parsedCart.forEach((item: any) => {
        const dbProd = dbProducts.find(p => p.id === item.productId);
        const dbPrice = dbProd?.variants[0]?.price || 0;

        if (dbPrice > 0) {
          const itemTotal = dbPrice * item.quantity;
          totalSecureSubtotal += itemTotal;
          
          // Cek apakah produk ini ada di daftar 'applicableProducts'
          // Jika list kosong, berarti berlaku untuk semua (global)
          if (allowedIds.length === 0 || allowedIds.includes(dbProd!.id)) {
            eligiblePromoSubtotal += itemTotal;
          }
        }
      });

      // Jika ada produk spesifik tapi nggak ada satupun di keranjang
      if (eligiblePromoSubtotal === 0) {
        return res.status(400).json({ success: false, message: "Produk di keranjangmu tidak memenuhi syarat promo ini" });
      }

      // 6. Validasi Min. Belanja (Hanya dihitung dari produk yang memenuhi syarat)
      if (eligiblePromoSubtotal < promo.minOrder) {
        return res.status(400).json({ 
          success: false, 
          message: `Belanja produk tertentu min. Rp ${promo.minOrder.toLocaleString('id-ID')} untuk pakai kode ini` 
        });
      }

      // 7. Hitung Diskon
      let discountAmount = 0;
      if (promo.type === "FIXED") {
        discountAmount = promo.value;
      } else {
        discountAmount = (eligiblePromoSubtotal * promo.value) / 100;
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) discountAmount = promo.maxDiscount;
      }

      // Final Check: Diskon nggak boleh lebih gede dari total bayar
      if (discountAmount > totalSecureSubtotal) discountAmount = totalSecureSubtotal;

      return res.status(200).json({
        success: true,
        promo: {
          id: promo.id,
          code: promo.code,
          name: promo.name,
          discountAmount: Math.floor(discountAmount)
        }
      });
    }

    // LIST PROMO (Tanpa perubahan besar)
    const promos = await prisma.promo.findMany({
      where: { 
        status: "ACTIVE",
        used: { lt: prisma.promo.fields.limit }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, data: promos });

  } catch (error) {
    console.error("ENTERPRISE_VALIDATION_ERROR:", error);
    return res.status(500).json({ success: false, message: "Gagal memproses validasi promo" });
  }
}