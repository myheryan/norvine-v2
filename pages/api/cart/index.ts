import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 
import prisma from "@/lib/prisma"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // Proteksi: Harus login untuk akses API ini
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const userId = user.id;

  // --- GET: AMBIL ISI KERANJANG ---
  if (req.method === 'GET') {
    try {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          variant: {
            include: {
              product: true, // WAJIB: Supaya dapet nama produk & thumbnailUrl
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(cartItems);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching cart", error });
    }
  }

  // --- POST: TAMBAH ATAU UPDATE QUANTITY ---
  if (req.method === 'POST') {
    const { variantId, quantity } = req.body; // quantity bisa positif (tambah) atau negatif (kurang)

    if (!variantId) return res.status(400).json({ message: "Variant ID is required" });

    try {
      // Cek apakah item sudah ada di keranjang
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_variantId: { userId, variantId },
        },
      });

      if (existingItem) {
        // Jika ada, update quantity-nya (Increment/Decrement)
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: { 
              increment: quantity // Jika quantity = 1 (nambah), jika -1 (ngurang)
            } 
          },
        });
        
        // Proteksi: Jika qty jadi 0 atau kurang, hapus sekalian
        if (updatedItem.quantity <= 0) {
          await prisma.cartItem.delete({ where: { id: updatedItem.id } });
          return res.status(200).json({ message: "Item removed (qty 0)" });
        }

        return res.status(200).json(updatedItem);
      } else {
        // Jika belum ada, buat baru
        const newItem = await prisma.cartItem.create({
          data: {
            userId,
            variantId,
            quantity: Math.max(1, quantity), // Minimal 1
          },
        });
        return res.status(201).json(newItem);
      }
    } catch (error) {
      return res.status(500).json({ message: "Error updating cart", error });
    }
  }

  // --- DELETE: HAPUS ITEM ---
  if (req.method === 'DELETE') {
    const { variantId } = req.body;

    try {
      await prisma.cartItem.delete({
        where: {
          userId_variantId: { userId, variantId },
        },
      });
      return res.status(200).json({ message: "Item deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting item", error });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}