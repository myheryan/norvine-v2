import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    // 1. Validasi input
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Data tidak lengkap (Token/Password kosong).' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Kata sandi baru minimal 8 karakter.' });
    }

    // 2. Cari user yang memiliki token tersebut dan cek apakah sudah expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Waktu kedaluwarsa harus lebih besar dari jam sekarang
        },
      },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Link reset tidak valid atau sudah kedaluwarsa. Silakan minta link baru.' 
      });
    }

    // 3. Hash kata sandi baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update kata sandi dan hapus token agar tidak bisa digunakan lagi (Security)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,       // Hapus token setelah digunakan
        resetTokenExpiry: null, // Hapus expiry
      },
    });

    return res.status(200).json({ message: 'Kata sandi Anda berhasil diperbarui.' });

  } catch (error: any) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}