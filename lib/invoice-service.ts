import { sendEmail } from "./mail-service";

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
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 0; color: #000; background-color: #fff;">
      <div style="background-color: #000; padding: 40px 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 6px; text-transform: uppercase; font-weight: 900;">NORVINE</h1>
        <p style="color: #666; font-size: 9px; margin: 8px 0 0; letter-spacing: 3px; text-transform: uppercase;">Official Payment Terminal</p>
      </div>

      <div style="padding: 40px 30px;">
        <h2 style="font-size: 16px; margin: 0 0 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Invoice #${order.invoice}</h2>
        <p style="font-size: 13px; color: #000; margin: 0;">Halo <strong>${order.recipientName}</strong>,</p>
        <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 10px 0 0;">
          Pesanan Anda telah kami terima dan sedang menunggu pembayaran. Silakan akses tautan di bawah ini untuk menyelesaikan transaksi.
        </p>

        <div style="margin: 30px 0; border: 1px solid #000; padding: 25px; background-color: #ffffff; border-radius: 0px;">
          <p style="margin: 0; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Instruksi Pembayaran</p>
          
          <p style="margin: 15px 0 20px; font-size: 14px; font-weight: normal; color: #000; line-height: 1.5;">
            Metode: <strong style="text-transform: uppercase;">${order.bankName || 'QRIS / Digital Payment'}</strong><br/>
            ${order.vaNumber ? `VA Number: <strong style="font-family: monospace; font-size: 16px;">${order.vaNumber}</strong>` : 'Silakan buka tautan untuk melihat kode bayar.'}
          </p>
          
          <div style="margin: 10px 0;">
            <a href="${process.env.NEXTAUTH_URL}/payment/${order.invoice}" 
               style="display: block; text-align: center; padding: 16px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 0px;">
               Selesaikan Pembayaran Sekarang
            </a>
          </div>

          <p style="margin: 15px 0 0; font-size: 10px; color: #e53e3e; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; text-align: center;">
            Batas Waktu: ${order.paymentExpiry ? new Date(order.paymentExpiry).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #000; text-align: left;">
              <th style="padding: 10px 0; text-transform: uppercase; letter-spacing: 1px;">Item</th>
              <th style="padding: 10px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
              <th style="padding: 10px 0; text-align: right; text-transform: uppercase; letter-spacing: 1px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 0;">
                  <span style="font-weight: bold; color: #000; text-transform: uppercase; font-size: 11px;">${item.name || 'Produk'}</span>
                </td>
                <td style="padding: 15px 0; text-align: center;">${item.quantity}</td>
                <td style="padding: 15px 0; text-align: right;">${formatter.format(item.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="padding-top: 10px;">
          <table style="width: 100%; font-size: 12px; line-height: 2;">
            <tr><td style="color: #999; text-transform: uppercase;">Subtotal</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.subtotal)}</td></tr>
            ${order.discount > 0 ? `<tr style="color: #e53e3e;"><td>DISCOUNT</td><td style="text-align: right;">-${formatter.format(order.discount)}</td></tr>` : ''}
            <tr><td style="color: #999; text-transform: uppercase;">Shipping</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.shippingCost)}</td></tr>
            <tr><td style="color: #999; text-transform: uppercase;">Fees</td><td style="text-align: right; font-weight: bold;">${formatter.format(order.serviceFee + (order.insuranceCost || 0))}</td></tr>
            <tr style="font-size: 18px; font-weight: 900; color: #000;">
              <td style="padding-top: 20px; border-top: 2px solid #000;">TOTAL</td>
              <td style="padding-top: 20px; text-align: right; border-top: 2px solid #000;">${formatter.format(order.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 40px; padding: 20px; border: 1px solid #eee; font-size: 11px; color: #777; border-radius: 0px;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1px;">Alamat Pengiriman:</p>
          <p style="margin: 0; line-height: 1.5; text-transform: uppercase;">${order.shippingAddress?.fullAddress}</p>
        </div>
      </div>

      <div style="padding: 40px 30px; background-color: #fafafa; text-align: center; font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 2px;">
        &copy; 2026 Norvine Terminal • Norvine.co.id • Jakarta, Indonesia
      </div>
    </div>
  `;

  return await sendEmail({
    to,
    subject: `[PAYMENT REQUIRED] Invoice #${order.invoice} - Norvine Official`,
    html: htmlContent
  });
};