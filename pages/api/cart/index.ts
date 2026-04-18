import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 
import prisma from "@/lib/prisma"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    const userId = user.id;

    if (req.method === 'GET') {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { variant: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const formattedCart = cartItems.map(item => ({
        id: item.variant.product.id,
        variantId: item.variantId,
        name: item.variant.product.name,
        variant: item.variant.name,
        price: item.variant.price,
        quantity: item.quantity,
        stock: item.variant.stock,
        thumbnailUrl: item.variant.product.thumbnailUrl,
        variantImageUrl: item.variant.imageUrl,
        weight: item.variant.weight,
      }));

      return res.status(200).json(formattedCart);
    }

    if (req.method === 'POST') {
      const { variantId, quantity, isAbsolute } = req.body; 

      if (!variantId) return res.status(400).json({ message: "Variant ID is required" });

      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true }
      });

      if (!variant) return res.status(404).json({ message: "Variant not found" });

      const existingItem = await prisma.cartItem.findUnique({
        where: { userId_variantId: { userId, variantId } },
      });

      const targetQty = isAbsolute ? quantity : (existingItem ? existingItem.quantity + quantity : quantity);

      // VALIDASI STOK: Kirim respon 400, JANGAN biarkan throw error
      if (targetQty > variant.stock) {
        return res.status(400).json({ 
          message: `Maaf, stok tidak mencukupi. Sisa stok: ${variant.stock}`,
          availableStock: variant.stock 
        });
      }

      if (existingItem) {
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: isAbsolute ? quantity : { increment: quantity } },
        });
        
        if (updatedItem.quantity <= 0) {
          await prisma.cartItem.delete({ where: { id: updatedItem.id } });
          return res.status(200).json({ message: "Item removed" });
        }
        return res.status(200).json(updatedItem);
      } else {
        const newItem = await prisma.cartItem.create({
          data: { userId, variantId, quantity: Math.max(1, targetQty) },
        });
        return res.status(201).json(newItem);
      }
    }

    if (req.method === 'DELETE') {
      const { variantId } = req.body;
      await prisma.cartItem.delete({
        where: { userId_variantId: { userId, variantId } },
      });
      return res.status(200).json({ message: "Item deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    // Menangkap semua error agar tidak terjadi NetworkError (Crash)
    console.error("Cart API Error:", error);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
}