import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  // 1. Proteksi: Cek apakah user sudah login
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const email = session.user.email;

  // --- METHOD PUT: UPDATE DATA TEKS ATAU PASSWORD ---
  if (req.method === "PUT") {
    const { name, birth, phoneNumber, oldPassword, newPassword, isPasswordUpdate } = req.body;

    try {
      // LOGIKA A: UPDATE PASSWORD
      if (isPasswordUpdate) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          return res.status(400).json({ message: "Metode login Anda tidak mendukung perubahan kata sandi langsung (OAuth)." });
        }

        // Bandingkan password lama dengan hash di DB
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Kata sandi saat ini yang Anda masukkan salah." });
        }

        // Hash password baru (Salt rounds: 12)
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
          where: { email },
          data: { password: hashedNewPassword },
        });

        return res.status(200).json({ message: "Kata sandi berhasil diperbarui." });
      }

      // LOGIKA B: UPDATE PROFIL BIASA
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          phoneNumber,
          birth: birth ? new Date(birth) : null,
        },
      });
      return res.status(200).json(updatedUser);

    } catch (error: any) {
      console.error("API ERROR:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server database." });
    }
  }

  // --- METHOD PATCH: UPDATE FOTO PROFIL SAJA ---
  if (req.method === "PATCH") {
    const { imageUrl } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { image: imageUrl },
      });
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      return res.status(500).json({ message: "Gagal memperbarui foto profil." });
    }
  }

  // Jika method bukan PUT atau PATCH
  return res.status(405).json({ message: "Method not allowed" });
}