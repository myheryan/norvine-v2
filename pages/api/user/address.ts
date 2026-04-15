import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  // --- GET: Fetch addresses ---
// Di dalam handler API Anda
if (req.method === "GET") {
  try {
    const { mainOnly } = req.query;

    if (mainOnly === "true") {
      const mainAddress = await prisma.address.findFirst({
        where: { userId, isMain: true },
      });
      // Jika tidak ada isMain, ambil yang paling baru
      const fallback = mainAddress || await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(fallback ? [fallback] : []);
    }

    // Default: Ambil semua untuk modal "Ganti Alamat"
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isMain: "desc" },
    });
    return res.status(200).json(addresses);
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data" });
  }
}

  // --- POST: Create address ---
  if (req.method === "POST") {
    try {
      const { label, recipient, phone, fullAddress, province, city, district, postalCode, isMain } = req.body;

      // Validasi minimal
      if (!label || !recipient || !fullAddress) {
        return res.status(400).json({ message: "Data tidak lengkap" });
      }

      // Gunakan Transaction untuk atomisitas
      const result = await prisma.$transaction(async (tx) => {
        if (isMain) {
          await tx.address.updateMany({
            where: { userId },
            data: { isMain: false },
          });
        }

        return await tx.address.create({
          data: {
            userId, label, recipient, phone, fullAddress,
            province, city, district, postalCode, isMain: !!isMain 
          },
        });
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Address Error:", error); 
      return res.status(500).json({ message: "Database Error" });
    }
  }

  // --- PUT: Update address (Untuk "Ubah" & "Jadikan Utama") ---
  if (req.method === "PUT") {
    try {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID alamat diperlukan" });
      }

      // Gunakan Transaction jika user mengubah alamat ini menjadi Utama
      if (updateData.isMain) {
        const result = await prisma.$transaction(async (tx) => {
          // 1. Matikan isMain di semua alamat milik user ini
          await tx.address.updateMany({
            where: { userId },
            data: { isMain: false },
          });

          // 2. Set isMain: true (dan update data lainnya) pada alamat yang dipilih
          return await tx.address.update({
            where: { id },
            data: { ...updateData, isMain: true },
          });
        });

        return res.status(200).json(result);
      }

      // Jika hanya update data biasa (bukan dijadikan utama)
      const updatedAddress = await prisma.address.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(updatedAddress);
    } catch (error) {
      console.error("Update Error:", error);
      return res.status(500).json({ message: "Gagal memperbarui data" });
    }
  }

  // --- DELETE: Hapus address ---
  if (req.method === "DELETE") {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID alamat diperlukan" });
      }

      await prisma.address.delete({
        where: { id, userId }, // Pastikan hanya bisa menghapus alamat miliknya sendiri
      });

      return res.status(200).json({ message: "Alamat berhasil dihapus" });
    } catch (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ message: "Gagal menghapus data" });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: "Method Not Allowed" });
}