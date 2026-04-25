import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail-service'; // Pastikan path ke fungsi nodemailer Anda benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Alamat email wajib diisi.' });

    // 1. Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });

    // Keamanan: Tetap kirim sukses meskipun email tidak terdaftar 
    // agar orang luar tidak tahu siapa saja yang punya akun.
    if (!user) {
      return res.status(200).json({ message: 'Jika email terdaftar, instruksi reset akan dikirimkan.' });
    }

    // 2. Buat Token Reset & Expiry (Berlaku 1 jam)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    // 3. Simpan Token ke Database User
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // 4. Buat URL Reset Password
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // 5. Template Email gaya Norvine (Minimalis & Elegan)
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f4f4f4; padding: 40px; text-align: center; color: #000;">
        <h2 style="text-transform: uppercase; letter-spacing: 4px; font-weight: 900; margin-bottom: 10px;">Norvine</h2>
        <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 2px; color: #666; margin-bottom: 40px;">Reset Password Request</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 30px;">
          Kami menerima permintaan untuk mengatur ulang kata sandi Anda.<br/>
          Klik tombol di bawah untuk melanjutkan proses reset.
        </p>

        <a href="${resetUrl}" 
           style="background-color: #000; color: #fff; padding: 15px 35px; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
           Setel Ulang Sandi
        </a>

        <p style="font-size: 10px; color: #999; margin-top: 40px;">
          Link ini berlaku selama 1 jam.<br/>
          Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.
        </p>
      </div>
    `;

    // 6. Kirim Email
    await sendEmail({
      to: email,
      subject: "Atur Ulang Kata Sandi Norvine",
      html: emailHtml,
    });

    return res.status(200).json({ message: 'Jika email terdaftar, instruksi reset akan dikirimkan.' });

  } catch (error: any) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return res.status(500).json({ message: 'Gagal memproses permintaan.' });
  }
}