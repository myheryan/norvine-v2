import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"; 
import { generateOTP, hashOTP } from "@/lib/otp"; // Import hashOTP untuk validasi

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { action, email, name, password, birth, phoneNumber, otp } = req.body;

  try {
    // TAHAP 1: Cek Ketersediaan Email
    if (action === "check-email") {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar." });
      return res.status(200).json({ message: "Email tersedia." });
    }

    // TAHAP 2: Request OTP & Kirim Email
    if (action === "request") {
      const result = await generateOTP(email);
      if (!result.success) {
        return res.status(400).json({ message: result.message || "Gagal kirim email." });
      }
      return res.status(200).json({ message: "OTP terkirim ke email Anda." });
    }

    // TAHAP 3: Verifikasi OTP & Simpan User (REGISTER)
    if (action === "verify") {
      if (!otp) return res.status(400).json({ message: "Kode OTP wajib diisi." });

      const tokenRecord = await prisma.verificationToken.findUnique({
        where: { identifier: email }
      });

      // 1. Validasi keberadaan Token
      if (!tokenRecord) {
        return res.status(400).json({ message: "Sesi habis. Silakan minta OTP baru." });
      }

      // 2. Cek Expiry
      if (new Date() > tokenRecord.expires) {
        return res.status(400).json({ message: "OTP kedaluwarsa. Silakan minta baru." });
      }

      // 3. VALIDASI HASH (SINKRONISASI)
      // Kita hash input user lalu bandingkan dengan hash di DB
      const hashedUserInput = hashOTP(otp);
      if (tokenRecord.token !== hashedUserInput) {
        return res.status(400).json({ message: "Kode OTP yang Anda masukkan salah." });
      }

      // 4. Jika OTP Benar, Proses Hashing Password & Simpan User
      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.$transaction([
        prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            birth: birth ? new Date(birth) : null,
            phoneNumber,
            role: "USER",
            emailVerified: new Date(),
          },
        }),
        // Hapus token setelah berhasil agar tidak bisa dipakai ulang
        prisma.verificationToken.delete({ where: { identifier: email } }),
      ]);

      return res.status(201).json({ message: "Akun Norvine berhasil dibuat!" });
    }

    return res.status(400).json({ message: "Aksi tidak dikenal." });

  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);
    if (error.code === 'P2002') return res.status(400).json({ message: "Email sudah terdaftar." });
    return res.status(500).json({ message: "Terjadi kesalahan internal server." });
  }
}