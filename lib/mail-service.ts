import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Interface untuk parameter fungsi
interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// 1. Fungsi Utama (Core Sender)
export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Html: { Data: html } },
      Subject: { Data: subject },
    },
    Source: "Norvine Official <no-reply@norvine.co.id>", // Nama pengirim Norvine
  });

  try {
    return await sesClient.send(command);
  } catch (error) {
    console.error("SES Error:", error);
    throw new Error("Gagal mengirim email");
  }
};

// 2. Helper: Template OTP
export const sendOTPMail = async (to: string, otpCode: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
      <h2 style="color: #111;">Verifikasi Keamanan</h2>
      <p style="color: #666;">Gunakan kode OTP di bawah ini untuk melanjutkan:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; padding: 10px; background: #f3f4f6; border-radius: 8px;">
        ${otpCode}
      </div>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.</p>
    </div>
  `;
  return await sendEmail({ to, subject: `${otpCode} adalah kode OTP Norvine Anda`, html });
};

// 3. Helper: Template Invoice
export const sendInvoiceMail = async (to: string, data: { id: string, amount: number, name: string }) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h3 style="color: #111;">Invoice #${data.id}</h3>
      <p>Halo ${data.name}, pesanan Anda telah kami terima.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">Deskripsi</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">Total</th>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">Pembayaran Layanan Norvine</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">Rp ${data.amount.toLocaleString()}</td>
        </tr>
      </table>
      <p style="text-align: right; font-weight: bold; font-size: 18px;">Total: Rp ${data.amount.toLocaleString()}</p>
    </div>
  `;
  return await sendEmail({ to, subject: `Invoice Pembayaran #${data.id}`, html });
};

// 4. Helper: Template Registration
export const sendWelcomeMail = async (to: string, name: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
      <h2 style="color: #111;">Selamat Datang di Norvine!</h2>
      <p>Halo <b>${name}</b>, akun Anda telah berhasil dibuat.</p>
      <p>Silakan eksplorasi dashboard Anda dan mulai kelola bisnis Anda lebih mudah.</p>
      <a href="https://norvine.co.id/dashboard" style="display: inline-block; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 10px;">Buka Dashboard</a>
    </div>
  `;
  return await sendEmail({ to, subject: "Selamat Datang di Norvine", html });
};