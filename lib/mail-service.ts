import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { formatDateTime, formatIDR } from "./utils";

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

interface OrderItemWithDetails {
  product: { name: string };
  variant?: { name: string } | null;
  quantity: number;
  priceAtBuy: number;
}

interface TransactionWithRelations {
  invoice: string;
  user: { name: string | null; email: string | null };
  createdAt: Date;
  paymentMethod: string;
  status: string;
  items: OrderItemWithDetails[];
  subtotal: number;
  shippingCost: number;
  insuranceCost: number;
  discount: number;
  totalAmount: number;
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

export const getOTPEmailTemplate = async (to: string, name: string, otpCode: string) => {
  const subject = `KODE VERIFIKASI NORVINE [${otpCode}]`
  const html = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 20px; font-family: Arial, sans-serif;">
      <tbody>
        <tr>
          <td align="center">
            <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #000000; padding: 40px 15px; text-align: center;">
                <img src="https://norvine.co.id/norvine-logo.png" alt="Norvine Logo" style="width: 240px; height: auto; display: block; margin: 0 auto;">
              </div>
              <div style="padding: 40px; color: #000000; font-size: 15px; text-align: left; line-height: 1.5;">
                <h2 style="margin: 0 0 20px 0; font-size: 18px; text-transform: uppercase; font-weight: 600;">KODE VERIFIKASI</h2>
                <p style="margin: 0 0 10px 0;">Halo <strong>${name}</strong>,</p>
                <p style="margin: 0 0 30px 0;">Gunakan kode OTP berikut untuk verifikasi akun Anda:</p>
                <div style="margin: 30px 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #000000;">
                  ${otpCode}
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

    return await sendEmail({ to, subject: `${otpCode} adalah kode OTP Norvine Anda`, html });
  
};



// 4. Helper: Template Registration
export const sendWelcomeMail = async (to: string, name: string) => {
  const html = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; font-family: Arial, sans-serif;">
      <tbody>
        <tr>
          <td align="center">
            <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #000000; padding: 40px 15px; text-align: center;">
                <img src="https://norvine.co.id/norvine-logo.png" alt="Norvine Logo" style="width: 240px; height: auto; display: block; margin: 0 auto;">
              </div>
              <div style="padding: 40px; color: #000000; font-size: 15px; text-align: left; line-height: 1.5;">
                <p style="margin: 0 0 10px 0;">Halo <strong>${name}</strong>,</p>
                <p style="margin: 0 0 10px 0;">Terima kasih telah mendaftar di Norvine.</p>
                <p style="margin: 0 0 10px 0;">Akun Anda telah aktif dan sudah dapat digunakan untuk mulai berbelanja.</p>
                <p style="margin: 0;">Nikmati berbagai promo eksklusif yang tersedia.</p>
                <div style="margin-top: 30px;">
                  <a href="https://norvine.co.id" style="background-color: #e3524f; color: #ffffff; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 4px;">Lakukkan Pembelian Pertama Anda</a>
                </div>
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
  return await sendEmail({ to, subject: "Selamat Datang di Norvine", html });
};

export const sendPaymentSuccessEmail = async (order: TransactionWithRelations) => {
  const recipientEmail = order.user.email;
  
  if (!recipientEmail) {
    console.error("Gagal mengirim email: Email user tidak ditemukan.");
    return;
  }

  // Generate baris item produk
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-top: 1px solid #f3f4f6;">
        <strong>${item.product.name.toLowerCase()}</strong><br>
        <span style="font-size: 11px; color: #6b7280;">${item.variant?.name?.toLowerCase() || '-'}</span>
      </td>
      <td align="center" style="padding: 8px 0; border-top: 1px solid #f3f4f6;">${item.quantity}</td>
      <td align="right" style="padding: 8px 0; border-top: 1px solid #f3f4f6; font-weight: bold;">${formatIDR(item.priceAtBuy)}</td>
    </tr>
  `).join('');

  // Template HTML
  const bodyHtml = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 20px; font-family: Arial, sans-serif;">
      <tbody>
        <tr>
          <td align="center">
            <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #000000; padding: 40px 15px; text-align: center;">
                <img src="https://norvine.co.id/norvine-logo.png" alt="Norvine Logo" style="width: 240px; height: auto; display: block; margin: 0 auto;">
              </div>
              <div style="padding: 40px; color: #000000; font-size: 14px; text-align: left; line-height: 1.5;">
                <h2 style="color: #22c55e; margin: 0 0 20px 0; font-size: 18px; font-weight: 900;">✓ Pembayaran Berhasil</h2>
                <p style="margin: 0 0 10px 0;">Halo <strong>${order.user.name || 'Pelanggan'}</strong>,</p>
                <p style="margin: 0 0 20px 0;">Terima kasih, telah berbelanja!</p>

                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700;">Berikut detail pesananmu:</h3>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 2;">
                    <tr><td width="140" style="color: #6b7280;">Nomor Pesanan</td><td width="10">:</td><td style="font-weight: bold;">${order.invoice}</td></tr>
                    <tr><td style="color: #6b7280;">Tanggal</td><td>:</td><td style="font-weight: bold;">${formatDateTime(order.createdAt)}</td></tr>
                    <tr><td style="color: #6b7280;">Metode Pembayaran</td><td>:</td><td style="font-weight: bold; text-transform: uppercase;">${order.paymentMethod}</td></tr>
                  </table>

                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; border-top: 1px solid #d1d5db;">
                    <thead>
                      <tr>
                        <th align="left" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Produk</th>
                        <th align="center" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Qty</th>
                        <th align="right" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Harga</th>
                      </tr>
                    </thead>
                    <tbody>${orderItemsHtml}</tbody>
                  </table>

                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px; border-top: 1px solid #000; padding-top: 15px; font-size: 13px;">
                    <tr><td style="color: #6b7280; padding-bottom: 5px;">Subtotal</td><td align="right" style="padding-bottom: 5px;">${formatIDR(order.subtotal)}</td></tr>
                    <tr><td style="color: #6b7280; padding-bottom: 5px;">Ongkir</td><td align="right" style="padding-bottom: 5px;">${formatIDR(order.shippingCost)}</td></tr>
                    ${order.insuranceCost > 0 ? `<tr><td style="color: #ef4444; padding-bottom: 5px;">Diskon</td><td align="right" style="color: #ef4444; padding-bottom: 5px;">-${formatIDR(order.insuranceCost)}</td></tr>` : ''}
                    <tr><td style="color: #ef4444; padding-bottom: 5px;">Biaya Platform</td><td align="right" style="color: #ef4444; padding-bottom: 5px;">-${formatIDR(500)}</td></tr>
                    ${order.discount > 0 ? `<tr><td style="color: #ef4444; padding-bottom: 5px;">Diskon</td><td align="right" style="color: #ef4444; padding-bottom: 5px;">-${formatIDR(order.discount)}</td></tr>` : ''}
                    <tr><td style="font-weight: bold; font-size: 15px; padding-top: 10px;">Total Pembayaran</td><td align="right" style="font-weight: bold; font-size: 15px; padding-top: 10px; color: #000;">${formatIDR(order.totalAmount)}</td></tr>
                  </table>
                </div>

                <p style="margin: 0 0 10px 0;">Saat ini pesananmu sedang kami proses dan akan segera kami kirim.</p>
                <p style="margin: 0;">Status pesanan dapat dicek secara berkala melalui menu <strong>"Pesanan Saya"</strong> pada website kami.</p>
              </div>
              <div style="background-color: #e5e7eb; padding: 25px; text-align: center; color: #000000; font-size: 12px; border-top: 1px solid #d1d5db;">
                <p style="margin: 0;">Butuh Bantuan? Hubungi kami di: <a href="mailto:support@norvine.co.id" style="color: #000000; text-decoration: underline; font-weight: bold;">support@norvine.co.id</a></p>
                <p style="margin: 5px 0 0 0;">atau <strong>0813-7000-8002</strong></p>
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

  // 3. Command SES
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [recipientEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: bodyHtml,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `[NORVINE] Pembayaran Berhasil - ${order.invoice}`,
      },
    },
    Source: "Norvine Indonesia <support@norvine.co.id>", // Pastikan email ini sudah diverifikasi di SES
  });

  try {
    const result = await sesClient.send(command);
    console.log("Email berhasil dikirim:", result.MessageId);
    return result;
  } catch (error) {
    console.error("Gagal mengirim email SES:", error);
    throw error;
  }
};