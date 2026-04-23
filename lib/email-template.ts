import { sendMail } from "./mail";

/**
 * Fungsi khusus untuk mengirim Invoice Pesanan (Menunggu Pembayaran)
 */
export const sendInvoiceEmail = async (to: string, order: any) => {
  const formatter = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  });

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 0; color: #333; background-color: #fff;">
      <div style="background-color: #000; padding: 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 4px; text-transform: uppercase;">NORVINE</h1>
        <p style="color: #26aa99; font-size: 10px; margin: 5px 0 0; letter-spacing: 2px; text-transform: uppercase;">Official Store</p>
      </div>

      <div style="padding: 40px 30px;">
        <h2 style="font-size: 18px; margin: 0 0 10px; font-weight: bold; text-transform: uppercase;">Invoice #${order.invoice}</h2>
        <p style="font-size: 13px; color: #666; margin: 0;">Halo <strong>${order.recipientName}</strong>,</p>
        <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 10px 0 0;">
          Pesanan Anda telah kami terima dan sedang menunggu pembayaran. Silakan selesaikan pembayaran sebelum batas waktu berakhir.
        </p>

        <div style="margin: 30px 0; border: 1px solid #26aa99; padding: 20px; background-color: #f6fcfb;">
          <p style="margin: 0; font-size: 10px; color: #26aa99; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Instruksi Pembayaran</p>
          <p style="margin: 10px 0 5px; font-size: 16px; font-weight: bold; color: #000;">
            ${order.bankName?.toUpperCase()} ${order.vaNumber ? `- ${order.vaNumber}` : ''}
          </p>
          
          ${order.qrUrl ? `
            <div style="margin: 15px 0;">
              <img src="${order.qrUrl}" alt="QRIS Code" style="width: 150px; height: 150px; border: 1px solid #eee;" />
              <p style="font-size: 11px; color: #888; margin-top: 5px;">Scan QRIS di atas melalui aplikasi bank atau e-wallet Anda.</p>
            </div>
          ` : ''}

          <p style="margin: 15px 0 0; font-size: 11px; color: #e53e3e; font-weight: bold;">
            Batas Waktu: ${order.paymentExpiry ? new Date(order.paymentExpiry).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #000; text-align: left;">
              <th style="padding: 10px 0; text-transform: uppercase;">Produk</th>
              <th style="padding: 10px 0; text-align: center; text-transform: uppercase;">Qty</th>
              <th style="padding: 10px 0; text-align: right; text-transform: uppercase;">Harga</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 0;">
                  <span style="font-weight: bold; color: #000;">${item.name || 'Produk'}</span>
                </td>
                <td style="padding: 15px 0; text-align: center;">${item.quantity}</td>
                <td style="padding: 15px 0; text-align: right;">${formatter.format(item.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px solid #eee; padding-top: 10px;">
          <table style="width: 100%; font-size: 12px; line-height: 2;">
            <tr><td style="color: #888;">Subtotal</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.subtotal)}</td></tr>
            ${order.discount > 0 ? `<tr style="color: #e53e3e;"><td>Promo Diskon</td><td style="text-align: right;">-${formatter.format(order.discount)}</td></tr>` : ''}
            <tr><td style="color: #888;">Ongkos Kirim</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.shippingCost)}</td></tr>
            ${order.insuranceCost > 0 ? `<tr><td style="color: #888;">Asuransi</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.insuranceCost)}</td></tr>` : ''}
            <tr><td style="color: #888;">Biaya Layanan</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.serviceFee)}</td></tr>
            <tr style="font-size: 16px; font-weight: bold; color: #000;">
              <td style="padding-top: 20px; border-top: 1px solid #eee;">TOTAL</td>
              <td style="padding-top: 20px; text-align: right; border-top: 1px solid #eee; color: #26aa99;">${formatter.format(order.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 40px; padding: 20px; background-color: #fafafa; border-radius: 4px; font-size: 11px; color: #777;">
          <p style="margin: 0 0 5px; font-weight: bold; color: #333; text-transform: uppercase;">Alamat Pengiriman:</p>
          <p style="margin: 0; line-height: 1.5;">${order.shippingAddress}</p>
        </div>
      </div>

      <div style="padding: 30px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">
        &copy; 2026 Norvine.co.id • Jakarta, Indonesia
      </div>
    </div>
  `;

  return await sendMail({
    to,
    subject: `[Menunggu Pembayaran] Invoice #${order.invoice} - Norvine Official`,
    html: htmlContent
  });
};