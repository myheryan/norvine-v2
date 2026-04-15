import React from "react";
import Head from "next/head";

// --- DUMMY DATA ---
const dummyOrder = {
  id: "cltwzxyz1000008lc2p4a3v9h",
  invoice: "INV/20260403/MED/001024",
  status: "SHIPPED",
  subtotal: 150000,
  discount: 20000,
  shippingCost: 15000,
  totalAmount: 145000,
  shippingAddress: "Jl. Pegangsaan Dua No.14, RT.2/RW.3, Pegangsaan Dua, Kec. Kelapa Gading, Jakarta Utara, 14250",
  recipientName: "Budi Santoso",
  recipientPhone: "081234567890",
  waybill: "LP987654321012",
  paymentMethod: "Bank Transfer (BCA VA)",
  paymentDate: "2026-04-02T10:15:00.000Z",
  createdAt: "2026-04-02T10:00:00.000Z",
  user: {
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phoneNumber: "081234567890",
  },
  promo: {
    code: "SEHATAPRIL20",
  },
  items: [
    {
      id: "1",
      quantity: 2,
      priceAtBuy: 50000,
      product: { name: "Vitamin C 1000mg Imun Booster", sku: "VITC-1000-30" },
      variant: { name: "Botol 30 Tablet" },
    },
    {
      id: "2",
      quantity: 1,
      priceAtBuy: 50000,
      product: { name: "Paracetamol 500mg", sku: "PCT-500-10" },
      variant: { name: "Strip 10 Kaplet" },
    },
  ]
};

// --- HELPER FUNCTIONS ---
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(dateString));
};

export default function OrderInvoicePage() {
  const order = dummyOrder;

  return (
    <>
      <Head>
        <title>Invoice - {order.invoice}</title>
      </Head>

      {/* Background abu-abu untuk layar, putih untuk print */}
      <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0 font-sans text-gray-800">
        
        {/* Tombol Print (Sembunyi saat dicetak) */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-end print:hidden">
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            🖨️ Cetak Invoice (PDF)
          </button>
        </div>

        {/* CONTAINER KERTAS A4 */}
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-lg print:shadow-none print:p-0 relative overflow-hidden">
          
          {/* WATERMARK STATUS */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none transform -rotate-45 text-[8rem] font-bold uppercase tracking-widest text-gray-900">
            {order.status}
          </div>

          {/* HEADER INVOICE */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">INVOICE</h1>
              <p className="text-sm text-gray-500 mt-1">No. <span className="font-mono text-gray-900 font-semibold">{order.invoice}</span></p>
              <p className="text-sm text-gray-500">Tanggal: {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">NAMA TOKO KAMU</h2>
              <p className="text-sm text-gray-600">Jl. Teknologi No.99, Jakarta Selatan</p>
              <p className="text-sm text-gray-600">cs@tokokamu.com | 021-9876543</p>
            </div>
          </div>

          {/* DUA KOLOM INFO (PEMBELI & PENGIRIMAN) */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 uppercase border-b pb-1">Diterbitkan Untuk</h3>
              <p className="font-bold text-gray-800">{order.user.name}</p>
              <p className="text-gray-600">{order.user.phoneNumber}</p>
              <p className="text-gray-600">{order.user.email}</p>
              <div className="mt-3">
                <span className="block font-semibold text-gray-900 uppercase">Metode Pembayaran:</span>
                <span className="text-gray-600">{order.paymentMethod}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 uppercase border-b pb-1">Info Pengiriman</h3>
              <p className="font-bold text-gray-800">{order.recipientName} ({order.recipientPhone})</p>
              <p className="text-gray-600 leading-relaxed">{order.shippingAddress}</p>
              {order.waybill && (
                <div className="mt-3 bg-gray-50 p-2 border border-dashed border-gray-300 w-max">
                  <span className="block text-xs uppercase text-gray-500">Nomor Resi:</span>
                  <span className="font-mono font-bold text-gray-900 text-base">{order.waybill}</span>
                </div>
              )}
            </div>
          </div>

          {/* TABEL PRODUK */}
          <div className="mb-8">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-900 uppercase">
                  <th className="py-2 px-3 border border-gray-300 w-12 text-center">No</th>
                  <th className="py-2 px-3 border border-gray-300">Deskripsi Produk</th>
                  <th className="py-2 px-3 border border-gray-300 text-center w-24">Qty</th>
                  <th className="py-2 px-3 border border-gray-300 text-right w-32">Harga Satuan</th>
                  <th className="py-2 px-3 border border-gray-300 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-3 px-3 border-x border-gray-300 text-center text-gray-500">{index + 1}</td>
                    <td className="py-3 px-3 border-x border-gray-300">
                      <p className="font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Varian: {item.variant.name} | SKU: {item.product.sku}</p>
                    </td>
                    <td className="py-3 px-3 border-x border-gray-300 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 border-x border-gray-300 text-right">{formatRupiah(item.priceAtBuy)}</td>
                    <td className="py-3 px-3 border-x border-gray-300 text-right font-medium text-gray-900">
                      {formatRupiah(item.quantity * item.priceAtBuy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KALKULASI HARGA & CATATAN */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Kolom Kiri: Catatan Tambahan */}
            <div className="w-full md:w-1/2 text-sm text-gray-500">
              <h4 className="font-semibold text-gray-900 uppercase mb-1">Catatan Penting</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</li>
                <li>Faktur ini sah dan di-generate otomatis oleh sistem.</li>
                <li>Simpan faktur ini sebagai bukti pembelian dan garansi.</li>
              </ul>
            </div>

            {/* Kolom Kanan: Rincian Biaya */}
            <div className="w-full md:w-1/2">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal Produk</span>
                  <span className="font-medium">{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="font-medium">{formatRupiah(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Promo ({order.promo.code})</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t-2 border-gray-800 pt-2 mt-2">
                  <span className="text-base font-bold text-gray-900 uppercase">Grand Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatRupiah(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER & TTD */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-8">Penerima</p>
              <div className="w-32 border-b border-gray-400"></div>
              <p className="text-xs mt-1 text-gray-600">{order.recipientName}</p>
            </div>
            
            <div className="text-right text-xs text-gray-400 font-mono">
              Dicetak pada: {formatDate(new Date().toISOString())}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}