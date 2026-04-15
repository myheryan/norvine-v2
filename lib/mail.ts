import nodemailer from "nodemailer";

// Setup SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, // True jika port 465, false jika 587
  auth: { 
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD 
  },
});

export const sendMail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      headers: {
          'X-SES-CONFIGURATION-SET': 'Geomining-Tracker', 
      }
    });
    console.log("✅ Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false };
  }
};
/**
 * Fungsi khusus untuk Welcome Email (Google Sign-In)
 */
export const sendWelcomeEmail = async (to: string, name: string) => {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="text-transform: uppercase; letter-spacing: 2px; color: #000;">Selamat Datang di Norvine</h2>
      <p>Halo <strong>${name}</strong>,</p>
      <p>Terima kasih telah bergabung! Akun Anda telah berhasil dibuat melalui Google Sign-In.</p>
      <p>Sekarang Anda dapat mengakses dashboard, mengelola profil, dan menikmati layanan kami sepenuhnya.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL || '#'}" 
           style="background-color: black; color: white; padding: 12px 25px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px; display: inline-block;">
           Buka Dashboard
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 11px; color: #888;">Jika Anda tidak merasa mendaftar di Norvine, silakan abaikan email ini.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ,
      to,
      subject: "Selamat Datang di Norvine - Akun Anda Telah Aktif",
      html: htmlContent,
    });
    console.log("✅ Welcome email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Gagal mengirim welcome email:", error);
    return { success: false };
  }
};

