import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { z } from 'zod';

// Schema Validasi Zod yang lebih ketat
const applyPromoSchema = z.object({
  code: z.string().trim().min(1, { message: "Kode promo wajib diisi" }),
  // Kita tidak butuh input subtotal dari luar, kita hitung sendiri di server agar aman!
  cartItems: z.array(z.object({
    variantId: z.string(),
    productId: z.string(),
    quantity: z.number().min(1)
  })).min(1, { message: "Keranjang kosong" })
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    // 1. Validasi Input via Zod
    const validation = applyPromoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: validation.error.issues[0].message });
    }

    const { code, cartItems } = validation.data;
    const session = await getServerSession(req, res, authOptions);
    const now = new Date();

    // 2. Ambil Data Promo & Produk Terkait
    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
      include: { applicableProducts: { select: { id: true } } }
    });

    if (!promo) return res.status(404).json({ success: false, message: "Kode promo tidak ditemukan" });
    if (promo.status !== "ACTIVE") return res.status(400).json({ success: false, message: "Kode promo sudah tidak aktif" });
    if (promo.used >= promo.limit) return res.status(400).json({ success: false, message: "Kuota promo sudah penuh" });

    // 3. Validasi Tanggal
    if (promo.startDate && promo.startDate > now) return res.status(400).json({ success: false, message: "Promo belum dimulai" });
    if (promo.endDate && promo.endDate < now) return res.status(400).json({ success: false, message: "Promo sudah berakhir" });

    // 4. Validasi 1x Pakai per User (LOGIC TARGETED)
    if (session?.user) {
      const alreadyUsed = await prisma.transaction.findFirst({
        where: {
          userId: (session.user as any).id,
          promoId: promo.id,
          status: { notIn: ['CANCELLED', 'EXPIRED', 'FAILED'] } 
        }
      });
      if (alreadyUsed) return res.status(400).json({ success: false, message: "Voucher ini sudah pernah kamu gunakan" });
    }

    // 5. Kalkulasi Harga Real-Time dari Database (ANTI-FRAUD)
    const variantIds = cartItems.map(item => item.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true, productId: true }
    });

    let totalSecureSubtotal = 0;
    let eligiblePromoSubtotal = 0;
    const allowedProductIds = promo.applicableProducts.map(p => p.id);

    cartItems.forEach(item => {
      const dbV = dbVariants.find(v => v.id === item.variantId);
      if (dbV) {
        const itemTotal = dbV.price * item.quantity;
        totalSecureSubtotal += itemTotal;
        
        // Cek apakah produk masuk kriteria promo
        const isGlobal = allowedProductIds.length === 0;
        const isEligible = allowedProductIds.includes(dbV.productId);
        if (isGlobal || isEligible) {
          eligiblePromoSubtotal += itemTotal;
        }
      }
    });

    if (eligiblePromoSubtotal === 0) {
      return res.status(400).json({ success: false, message: "Produk di keranjang tidak memenuhi syarat promo" });
    }

    // 6. Validasi Min Belanja
    if (eligiblePromoSubtotal < promo.minOrder) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimal belanja produk terkait Rp ${promo.minOrder.toLocaleString('id-ID')} untuk promo ini.` 
      });
    }

    // 7. Kalkulasi Diskon Final
    let discountAmount = 0;
    if (promo.type === "FIXED") {
      discountAmount = promo.value;
    } else {
      discountAmount = (eligiblePromoSubtotal * promo.value) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    }

    // Cap agar diskon tidak lebih besar dari total belanja
    if (discountAmount > totalSecureSubtotal) discountAmount = totalSecureSubtotal;

    return res.status(200).json({
      success: true,
      message: `Berhasil! Kamu dapat potongan ${promo.name}`,
      promo: {
        id: promo.id,
        code: promo.code,
        name: promo.name,
        discountAmount: Math.floor(discountAmount)
      }
    });

  } catch (error) {
    console.error("PROMO_CRITICAL_ERROR:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan sistem" });
  }
}