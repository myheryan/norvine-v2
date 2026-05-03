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

  const bodyHtml = `
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; font-family: Arial, sans-serif;">
    <tbody>
      <tr>
        <td align="center">
          <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- HEADER LOGO -->
            <div style="background-color: #000000; padding: 40px 15px; text-align: center;">
              <img src="https://norvine.co.id/norvine-logo.png" alt="Norvine Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
            </div>

            <!-- BODY CONTENT -->
            <div style="padding: 40px; color: #000000; font-size: 14px; text-align: left; line-height: 1.6;">
              <h2 style="color: #22c55e; margin: 0 0 20px 0; font-size: 20px; font-weight: 900;">✓ Pembayaran Berhasil</h2>
              <p style="margin: 0 0 10px 0;">Halo <strong>${order.user?.name || 'Pelanggan'}</strong>,</p>
              <p style="margin: 0 0 20px 0;">Terima kasih telah berbelanja di Norvine! Pesananmu telah kami terima dan segera diproses.</p>

              <!-- ORDER BOX -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Detail Pesanan:</h3>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; margin-bottom: 15px;">
                  <tr><td width="140" style="color: #6b7280; padding: 4px 0;">Nomor Pesanan</td><td width="10">:</td><td style="font-weight: bold; color: #000;">${order.invoice}</td></tr>
                  <tr><td style="color: #6b7280; padding: 4px 0;">Tanggal</td><td>:</td><td style="font-weight: bold; color: #000;">${formatDateTime(order.createdAt)}</td></tr>
                  <tr><td style="color: #6b7280; padding: 4px 0;">Metode Bayar</td><td>:</td><td style="font-weight: bold; color: #000; text-transform: uppercase;">${order.paymentMethod}</td></tr>
                </table>

                <!-- ITEM LIST -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 10px; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th align="left" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Produk</th>
                      <th align="center" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Qty</th>
                      <th align="right" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                  </tbody>
                </table>

                <!-- BILLING CALCULATION -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px; border-top: 2px solid #000000; padding-top: 15px; font-size: 13px;">
                  <tr><td style="color: #6b7280; padding: 4px 0;">Subtotal</td><td align="right">${formatIDR(order.subtotal)}</td></tr>
                  <tr><td style="color: #6b7280; padding: 4px 0;">Ongkos Kirim</td><td align="right">${formatIDR(order.shippingCost)}</td></tr>
                  
                  ${order.insuranceCost > 0 ? `<tr><td style="color: #6b7280; padding: 4px 0;">Biaya Asuransi</td><td align="right">${formatIDR(order.insuranceCost)}</td></tr>` : ''}
                  
                  <tr><td style="color: #6b7280; padding: 4px 0;">Biaya Layanan</td><td align="right">${formatIDR(500)}</td></tr>
                  
                  ${order.discount > 0 ? `<tr><td style="color: #ef4444; padding: 4px 0;">Diskon Promo</td><td align="right" style="color: #ef4444;">-${formatIDR(order.discount)}</td></tr>` : ''}
                  
                  <tr>
                    <td style="font-weight: bold; font-size: 16px; padding-top: 15px; color: #000;">Total Bayar</td>
                    <td align="right" style="font-weight: bold; font-size: 16px; padding-top: 15px; color: #000;">${formatIDR(order.totalAmount)}</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 10px 0;">Pesananmu sedang dalam antrian pengemasan.</p>
              <p style="margin: 0;">Gunakan nomor invoice di atas untuk mengecek status pesanan pada menu <strong>Pesanan Saya</strong>.</p>
            </div>

            <!-- CONTACT FOOTER -->
            <div style="background-color: #f3f4f6; padding: 30px; text-align: center; color: #4b5563; font-size: 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0;">Butuh Bantuan? Hubungi Kami:</p>
              <p style="margin: 0;">
                <a href="mailto:support@norvine.co.id" style="color: #000; text-decoration: none; font-weight: bold;">support@norvine.co.id</a> 
                <span style="margin: 0 10px;">|</span> 
                <strong>0813-7000-8002</strong>
              </p>
              <p style="margin: 20px 0 0 0; color: #9ca3af;">&copy; 2026 Norvine Indonesia. All rights reserved.</p>
            </div>

          </div>
        </td>
      </tr>
    </tbody>
  </table>`;

  return await sendEmail({ 
    to: order.user?.email, 
    subject: `[Norvine] Konfirmasi Pembayaran - ${order.invoice}`, 
    html: bodyHtml  
  });
}