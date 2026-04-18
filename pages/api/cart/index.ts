import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 
import prisma from "@/lib/prisma"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true } // Cukup ambil ID saja lebih cepat
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
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(cartItems);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching cart" });
    }
  }

  // --- POST: TAMBAH ATAU UPDATE QUANTITY ---
  if (req.method === 'POST') {
    const { variantId, quantity } = req.body; 

    if (!variantId) return res.status(400).json({ message: "Variant ID is required" });

    try {
      // 1. AMBIL DATA VARIAN UNTUK CEK STOK
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true }
      });

      if (!variant) return res.status(404).json({ message: "Variant not found" });

      const existingItem = await prisma.cartItem.findUnique({
        where: { userId_variantId: { userId, variantId } },
      });

      // 2. HITUNG TOTAL QUANTITY YANG DIINGINKAN
      const currentQty = existingItem ? existingItem.quantity : 0;
      const targetQty = currentQty + quantity;

      // 3. VALIDASI STOK
      if (targetQty > variant.stock && quantity > 0) {
        return res.status(400).json({ 
          message: `Maaf, stok tidak mencukupi. Sisa stok: ${variant.stock}` 
        });
      }

      if (existingItem) {
        // Update (Increment/Decrement)
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: quantity } },
        });
        
        if (updatedItem.quantity <= 0) {
          await prisma.cartItem.delete({ where: { id: updatedItem.id } });
          return res.status(200).json({ message: "Item removed" });
        }

        return res.status(200).json(updatedItem);
      } else {
        // Create Baru
        const newItem = await prisma.cartItem.create({
          data: {
            userId,
            variantId,
            quantity: Math.min(Math.max(1, quantity), variant.stock), // Jangan lewatkan stok
          },
        });
        return res.status(201).json(newItem);
      }
    } catch (error) {
      return res.status(500).json({ message: "Error updating cart" });
    }
  }

  // --- DELETE: HAPUS ITEM ---
  if (req.method === 'DELETE') {
    const { variantId } = req.body;
    try {
      await prisma.cartItem.delete({
        where: { userId_variantId: { userId, variantId } },
      });
      return res.status(200).json({ message: "Item deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting item" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}