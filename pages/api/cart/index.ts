import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; 
import prisma from "@/lib/prisma"; 
import { z } from 'zod';

// Schema validasi input agar tidak ada data sampah
const cartSchema = z.object({
  variantId: z.string().min(1, "Variant ID wajib diisi"),
  quantity: z.number().int(),
  isAbsolute: z.boolean().optional().default(false)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Sesi berakhir, silakan login kembali." });
    }

    // Ambil User ID secara konsisten
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    const userId = user.id;

    // --- METHOD: GET (Ambil Isi Keranjang) ---
    if (req.method === 'GET') {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { 
          variant: { 
            include: { product: true } 
          } 
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter: Hanya tampilkan barang yang varian & produknya masih ada
      const formattedCart = cartItems
        .filter(item => item.variant && item.variant.product)
        .map(item => ({
          id: item.variant.product.id,
          variantId: item.variantId,
          name: item.variant.product.name,
          variantName: item.variant.name,
          price: item.variant.price,
          quantity: item.quantity,
          stock: item.variant.stock,
          thumbnailUrl: item.variant.imageUrl || item.variant.product.thumbnailUrl,
          weight: item.variant.weight,
          isAvailable: item.variant.product.isAvailable, // Penting untuk UI
          isDisplayOnly: item.variant.product.isDisplayOnly,
        }));

      return res.status(200).json(formattedCart);
    }

    // --- METHOD: POST (Tambah/Update Keranjang) ---
    if (req.method === 'POST') {
      const validation = cartSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.issues[0].message });
      }

      const { variantId, quantity, isAbsolute } = validation.data;

      // 1. Cek Varian & Status Produk (Targeted Guard)
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true }
      });

      if (!variant) return res.status(404).json({ message: "Produk sudah tidak tersedia." });
      if (!variant.product.isAvailable || variant.product.isDisplayOnly) {
        return res.status(400).json({ message: "Produk ini tidak dapat dibeli untuk saat ini." });
      }

      // 2. Hitung Target Quantity
      const existingItem = await prisma.cartItem.findUnique({
        where: { userId_variantId: { userId, variantId } },
      });

      const currentQty = existingItem?.quantity || 0;
      const targetQty = isAbsolute ? quantity : currentQty + quantity;

      // 3. Validasi Stok (Fail-safe)
      if (targetQty > variant.stock) {
        return res.status(400).json({ 
          message: `Maaf, stok terbatas. Sisa stok: ${variant.stock}`,
          availableStock: variant.stock 
        });
      }

      // Jika quantity menjadi 0 atau kurang, hapus item
      if (targetQty <= 0) {
        if (existingItem) {
          await prisma.cartItem.delete({ where: { id: existingItem.id } });
        }
        return res.status(200).json({ message: "Item dihapus dari keranjang" });
      }

      // 4. Upsert (Update atau Create)
      const cartItem = await prisma.cartItem.upsert({
        where: { userId_variantId: { userId, variantId } },
        update: { quantity: targetQty },
        create: { userId, variantId, quantity: targetQty },
      });

      return res.status(200).json(cartItem);
    }

    // --- METHOD: DELETE (Hapus Item) ---
    if (req.method === 'DELETE') {
      const { variantId } = req.body;
      if (!variantId) return res.status(400).json({ message: "Variant ID diperlukan" });

      await prisma.cartItem.delete({
        where: { userId_variantId: { userId, variantId } },
      }).catch(() => null); // Abaikan jika memang sudah tidak ada

      return res.status(200).json({ message: "Item dihapus" });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error("CART_CRITICAL_ERROR:", error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem pada keranjang." });
  }
}