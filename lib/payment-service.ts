import { coreApi } from '@/lib/midtrans';
import { xenditApi } from '@/lib/xendit';

export const processPayment = async (gateway: 'MIDTRANS' | 'XENDIT', params: any) => {
  if (gateway === 'XENDIT') {
    /**
     * Jalur XENDIT: Core API Style (QRIS)
     * Langsung mendapatkan QR String/URL tanpa redirect external.
     */
    const res = await xenditApi.createQRCode({
      externalId: params.orderId,
      amount: Math.round(params.finalAmount),
    });

    return {
      gatewayId: res.id,
      bankName: 'QRIS',
      // MENGISI PAYMENT METHOD SESUAI SCHEMA
      paymentMethod: 'XENDIT_QRIS', 
      vaNumber: null,
      paymentCode: null,
      // Menyimpan data QR ke field qrUrl
      qrUrl: res.qr_string || res.actions?.[0]?.url, 
      deepLink: null, 
      expiry: new Date(Date.now() + 15 * 60000), 
      raw: res
    };
  } else {
    // Jalur MIDTRANS: Core API Style
    const midtransParam: any = {
      payment_type: params.paymentMethod === "qris" ? "qris" : "bank_transfer",
      transaction_details: { 
        order_id: params.orderId, 
        gross_amount: Math.round(params.finalAmount) 
      },
      item_details: params.itemDetails,
      customer_details: params.customerDetails
    };

    if (params.paymentMethod !== "qris") {
      midtransParam.bank_transfer = { bank: params.paymentMethod.replace('_va', '') };
    }

    const res = await coreApi.charge(midtransParam);
    
    return {
      gatewayId: res.transaction_id,
      paymentMethod: `MIDTRANS_${params.paymentMethod.toUpperCase()}`,
      bankName: res.va_numbers?.[0]?.bank || (params.paymentMethod === 'qris' ? 'QRIS' : params.paymentMethod),
      vaNumber: res.va_numbers?.[0]?.va_number || null,
      paymentCode: res.payment_code || null,
      qrUrl: res.actions?.find((a: any) => a.name === "generate-qr-code")?.url || null,
      deepLink: null,
      expiry: res.expiry_time ? new Date(res.expiry_time) : null,
      raw: res
    };
  }
};