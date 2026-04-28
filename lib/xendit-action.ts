// Contoh fungsi cancel invoice
export const cancelXenditInvoice = async (invoiceId: string) => {
  const res = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}/expire!`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
    }
  });
  return await res.json();
};