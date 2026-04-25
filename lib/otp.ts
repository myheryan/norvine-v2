import { sendEmail } from "@/lib/mail-service"; // Pastikan path benar
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Hashing OTP untuk keamanan database
 */
export const hashOTP = (otp: string) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * Generate dan Kirim OTP Norvine
 */
export const generateOTP = async (email: string) => {
  try {
    // 1. RATE LIMITING CHECK
    const existingRequest = await prisma.verificationToken.findUnique({
      where: { identifier: email }
    });

    if (existingRequest && existingRequest.lastSent) {
      const timeSinceLastSent = Date.now() - new Date(existingRequest.lastSent).getTime();
      const waitTime = 60 * 1000; // Minimal tunggu 1 menit

      if (timeSinceLastSent < waitTime) {
        const remaining = Math.ceil((waitTime - timeSinceLastSent) / 1000);
        return { 
          success: false, 
          message: `Harap tunggu ${remaining} detik sebelum meminta kode baru.` 
        };
      }
    }

    // 2. GENERATE SECURE OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = hashOTP(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // Valid 5 menit

    // 3. UPSERT KE DATABASE
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
        expires,
        lastSent: new Date() 
      },
    });

    // 4. TEMPLATE EMAIL PROFESSIONAL (NORVINE STYLE)
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; color: #333;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 20px; letter-spacing: 4px; text-transform: uppercase;">NORVINE</h1>
        </div>
        
        <div style="padding: 30px; text-align: center;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Verifikasi Keamanan</h2>
          <p style="font-size: 14px; color: #666;">Gunakan kode di bawah ini untuk memverifikasi akun Anda. Kode ini rahasia dan berlaku selama 5 menit.</p>
          
          <div style="margin: 30px 0; background-color: #f6fcfb; border: 1px dashed #26aa99; padding: 20px; border-radius: 12px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #999;">Jika Anda tidak merasa meminta kode ini, abaikan email ini atau hubungi bantuan.</p>
        </div>
        
        <div style="padding: 20px; background-color: #fafafa; text-align: center; font-size: 10px; color: #aaa;">
          &copy; 2026 Norvine.co.id • Keamanan Akun Terjamin
        </div>
      </div>
    `;

    // 5. KIRIM VIA AWS SES
    await sendEmail({
      to: email,
      subject: `[Norvine Security] Kode Verifikasi Anda: ${otp}`,
      html: htmlContent,
    });

    return { success: true, message: "Kode OTP telah dikirim ke email Anda." };

  } catch (error) {
    console.error("❌ Enterprise OTP Error:", error);
    return { success: false, message: "Gagal mengirim kode verifikasi." };
  }
};