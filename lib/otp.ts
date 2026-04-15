import prisma from "./prisma";
import { sendMail } from "./mail";
import crypto from "crypto";

// Fungsi untuk hashing OTP agar tidak plaintext di DB
export const hashOTP = (otp: string) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const generateOTP = async (email: string) => {
  try {
    // 1. ENTERPRISE CHECK: Rate Limiting
    const existingRequest = await prisma.verificationToken.findUnique({
      where: { identifier: email }
    });

    if (existingRequest) {
      const timeSinceLastSent = Date.now() - existingRequest.lastSent.getTime();
      const waitTime = 60 * 1000; // Minimal tunggu 1 menit untuk Resend

      if (timeSinceLastSent < waitTime) {
        return { 
          success: false, 
          message: `Harap tunggu ${Math.ceil((waitTime - timeSinceLastSent) / 1000)} detik sebelum meminta kode baru.` 
        };
      }
    }

    // 2. Generate Secure OTP
    // Gunakan crypto.randomInt untuk angka yang lebih aman secara kriptografi
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = hashOTP(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

      await prisma.verificationToken.upsert({
        where: { identifier: email },
        update: { 
          token: hashedOtp, 
          expires, 
          attempts: 0, 
          lastSent: new Date() 
        },
        create: { 
          identifier: email, 
          token: hashedOtp, 
          expires 
        },
      });


    // 4. Kirim Email dengan Template Professional
    const mailResult = await sendMail({
      to: email,
      subject: `[Norvine Security] Kode Verifikasi: ${otp}`,
      html: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Verifikasi Akun Norvine</h2>
        <p>Kode OTP Anda adalah:</p>
        <h1 style="letter-spacing: 5px; font-size: 40px; color: black;">${otp}</h1>
        <p>Kode ini berlaku selama 5 menit.</p>
      </div>
      `,
    });
    mailResult;

    return { success: mailResult.success, otp: otp }; // Kirim plaintext otp ke API hanya untuk log/proses sesaat

  } catch (error) {
    console.error("❌ Enterprise OTP Error:", error);
    return { success: false, message: "Terjadi kesalahan pada sistem keamanan email." };
  }
};