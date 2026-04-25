import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt'; // Disarankan menggunakan bcryptjs untuk kompatibilitas Next.js
import  getServerSession from "next-auth";
import { authOptions } from "./[...nextauth]"; // Sesuaikan path ke file config NextAuth Anda

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Ambil sesi user untuk memastikan dia sudah login
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Anda harus login terlebih dahulu' });
    }

    const { oldPassword, newPassword } = req.body;

    // 2. Validasi Input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Kata sandi baru minimal 8 karakter' });
    }

    // 3. Ambil User dari Database berdasarkan email di session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // 4. Verifikasi Password Lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Kata sandi saat ini salah' });
    }

    // 5. Hash Password Baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 6. Update Database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: 'Kata sandi berhasil diubah' });

  } catch (error: any) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}