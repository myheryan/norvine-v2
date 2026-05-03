import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import Head from 'next/head';
import { FiPrinter, FiDownload, FiPackage, FiTruck, FiCreditCard } from 'react-icons/fi';

const formatRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function InvoicePage({ transaction }: any) {
  if (!transaction) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  return (
    <>
      <Head>
        <title>Invoice - {transaction.invoice}</title>
        <style media="print">{`header, nav, footer, .no-print, button { display: none !important; } @page { size: A4; margin: 10mm; } .print-container { width: 100% !important; box-shadow: none !important; border: none !important; }`}</style>
      </Head>

      <div className="min-h-screen bg-zinc-50 py-10 px-4 no-print">
        {/* ACTION BUTTONS */}
        <div className="max-w-[210mm] mx-auto mb-6 flex justify-end gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-all shadow-sm">
            <FiPrinter size={16} /> Print
          </button>
          <button onClick={() => window.location.href = `/api/invoice/download?id=${transaction.invoice}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            <FiDownload size={16} /> Download PDF
          </button>
        </div>

        {/* INVOICE CARD */}
        <div className="print-container p-12 w-[210mm] min-h-[297mm] bg-white text-zinc-800 mx-auto font-sans shadow-sm rounded-2xl border border-zinc-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
          
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-black text-blue-600 mb-1">NORVINE</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Official Store Invoice</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-zinc-900 uppercase">Invoice</h2>
              <p className="text-sm font-medium text-zinc-500">#{transaction.invoice}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 py-8 border-y border-zinc-100 mb-10">
            <div>
              <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-3 flex items-center gap-2"><FiPackage className="text-blue-500" /> Penerima</h4>
              <p className="text-sm font-bold">{transaction.recipientName}</p>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1">{transaction.shippingAddress}</p>
            </div>
            <div>
              <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-3 flex items-center gap-2"><FiTruck className="text-blue-500" /> Pengiriman</h4>
              <p className="text-xs font-bold uppercase">{transaction.shipment?.courierService || 'Regular'}</p>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase italic">{new Date(transaction.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
            </div>
            <div>
              <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-3 flex items-center gap-2"><FiCreditCard className="text-blue-500" /> Pembayaran</h4>
              <p className="text-xs font-bold uppercase">{transaction.paymentMethod}</p>
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${transaction.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {transaction.status}
              </div>
            </div>
          </div>

          <table className="w-full mb-10">
            <thead className="border-b border-zinc-200">
              <tr>
                <th className="pb-4 text-[10px] uppercase font-bold text-zinc-400">Produk</th>
                <th className="pb-4 text-[10px] uppercase font-bold text-zinc-400 text-center">Qty</th>
                <th className="pb-4 text-[10px] uppercase font-bold text-zinc-400 text-right">Harga</th>
                <th className="pb-4 text-[10px] uppercase font-bold text-zinc-400 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {transaction.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-5 text-sm font-semibold">{item.productId}</td>
                  <td className="py-5 text-center text-sm">{item.quantity}</td>
                  <td className="py-5 text-right text-sm text-zinc-500">{formatRp(item.priceAtBuy)}</td>
                  <td className="py-5 text-right text-sm font-bold">{formatRp(item.priceAtBuy * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6 border-t border-zinc-100">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-xs text-zinc-500"><span>Subtotal Produk</span><span>{formatRp(transaction.subtotal)}</span></div>
              <div className="flex justify-between text-xs text-zinc-500"><span>Ongkos Kirim</span><span>{formatRp(transaction.shippingCost)}</span></div>
              {transaction.discount > 0 && <div className="flex justify-between text-xs text-emerald-600 font-bold"><span>Promo</span><span>-{formatRp(transaction.discount)}</span></div>}
              <div className="flex justify-between text-lg font-black pt-4 border-t border-dashed border-zinc-200">
                <span className="text-sm font-bold uppercase text-zinc-500">Total</span>
                <span className="text-blue-600">{formatRp(transaction.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const transaction = await prisma.transaction.findUnique({ where: { invoice: String(params?.id) }, include: { items: true, shipment: true } });
  if (!transaction) return { notFound: true };
  return { props: { transaction: JSON.parse(JSON.stringify(transaction)) } };
};