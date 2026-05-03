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

         const htmlContent = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; font-family: Arial, sans-serif;">
      <tbody>
        <tr>
          <td align="center">
            <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #000000; padding: 40px 15px; text-align: center;">
                <img src="https://norvine.co.id/norvine-logo.png" alt="Norvine Logo" style="width: 240px; height: auto; display: block; margin: 0 auto;">
              </div>
              <div style="padding: 40px; color: #000000; font-size: 15px; text-align: left; line-height: 1.5;">
                <h2 style="margin: 0 0 20px 0; font-size: 18px; text-transform: uppercase; font-weight: 600;">KODE VERIFIKASI</h2>
                <p style="margin: 0 0 30px 0;">Gunakan kode OTP berikut untuk verifikasi akun Anda:</p>
                <div style="margin: 30px 0; background-color: #f6fcfb; border: 1px dashed #26aa99; padding: 20px; border-radius: 12px;text-align:center">
                  <span style="font-size: 32px;text-align:center; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
                </div>
                <p style="margin: 30px 0 0 0; font-size: 13px; color: #374151;">
                  Kode ini hanya berlaku 5 menit dan bersifat rahasia. Mohon untuk tidak membagikan kode ini kepada siapapun.
                </p>
              </div>
              <div style="background-color: #e5e7eb; padding: 25px; text-align: center; color: #000000; font-size: 12px; border-top: 1px solid #d1d5db;">
                <p style="margin: 0;">Butuh Bantuan? Hubungi E-mail: <a href="mailto:support@norvine.co.id" style="color: #000000; text-decoration: underline; font-weight: bold;">support@norvine.co.id</a> atau</p>
                <p style="margin: 5px 0 0 0;">WhatsApp: <strong>0813-7000-8002</strong></p>
              </div>
              <div style="padding: 20px; text-align: center; font-size: 12px; color: #4b5563; background-color: #f9fafb;">
                <p style="margin: 0;">© 2026 Norvine.co.id</p>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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