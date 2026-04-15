import React, { useRef } from "react";
import { Printer, Scissors, Phone } from "lucide-react";

interface ProductItem {
  name: string;
  qty: number;
}

interface ResiProps {
  orderData?: {
    recipient: string;
    phone: string;
    address: string[];
    orderId: string;
    products: ProductItem[];
    courierCode: string;
  };
}

export default function ResiShippingLabel({ orderData }: ResiProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Data Dummy jika props kosong (agar tampilan langsung terlihat)
  const data = orderData || {
    recipient: "Aji",
    phone: "0813-8462-1873",
    address: ["Jl. Contoh Alamat No. 123", "Kec. Cicendo, Kota Bandung", "Jawa Barat, 40173"],
    orderId: "N123456789",
    products: [
      { name: "NORVINE CALCIUM MAGNESIUM", qty: 1 },
      { name: "NORVINE TRIPLE GLUCOSAMINE CHONDROITIN & MSM", qty: 1 },
      { name: "NORVINE PREMIUM MULTIVITAMIN & MINERAL COMPLEX", qty: 1 },
      { name: "NORVINE C-500 MG – 60 Tablet", qty: 1 },
      { name: "NORVINE C-500 MG – 120 Tablet", qty: 1 },
    ],
    courierCode: "1234567890"
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8 flex flex-col items-center">
      {/* Tombol Print (Sembunyi saat Cetak) */}
      <button 
        onClick={handlePrint}
        className="mb-6 flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-emerald-600 transition-all print:hidden"
      >
        <Printer size={18} /> Cetak Resi
      </button>

      {/* Area Resi */}
      <div 
        ref={printRef}
        className="w-[450px] bg-white border border-zinc-300 shadow-sm p-6 text-[13px] leading-tight font-sans text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-black tracking-tighter leading-none">
              NOR<span className="text-red-600 italic">V</span>INE
            </h1>
            <p className="text-[10px] font-bold tracking-tight">www.norvine.co.id</p>
          </div>
        </div>

        {/* Informasi Penerima & Pengirim */}
        <div className="space-y-4 mb-4">
          <div>
            <p className="font-bold">Penerima : {data.recipient} ({data.phone})</p>
            {data.address.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div>
            <p className="font-bold">Pengirim : Norvine.co.id (0813-7000-8002)</p>
            <p>Cengkareng – Jakarta Barat</p>
          </div>
        </div>

        {/* No Pesanan */}
        <div className="mb-4">
          <p className="font-bold">No.Pesanan : {data.orderId}</p>
          <p className="font-bold border-b border-zinc-800 pb-0.5 mt-1 inline-block w-full">Produk :</p>
          
          {/* List Produk */}
          <div className="mt-1 space-y-0.5">
            {data.products.map((item, index) => (
              <div key={index} className="flex justify-between gap-4">
                <span className="uppercase">{item.name}</span>
                <span className="font-bold">{item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kurir & Barcode Area */}
        <div className="flex justify-between items-end mt-8">
          <div>
            {/* Logo Kurir (Lion Parcel Style) */}
            <div className="flex items-center gap-1 mb-2">
              <span className="text-red-600 font-black italic text-lg leading-none italic">Lion</span>
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                 <div className="w-3 h-1 bg-white rotate-45" />
              </div>
              <span className="text-red-600 font-bold text-lg leading-none italic italic">parcel</span>
            </div>
            
            {/* Dummy Barcode Area */}
            <div className="space-y-1">
              <div className="flex items-end gap-[1px]">
                {[2, 4, 1, 3, 2, 5, 2, 4, 1, 3, 4, 2, 1, 5, 2].map((h, i) => (
                  <div key={i} className="bg-black w-[2.5px]" style={{ height: `${h * 8}px` }} />
                ))}
              </div>
              <p className="text-center tracking-[4px] font-medium">{data.courierCode}</p>
            </div>
          </div>

          {/* Booking Code & QR */}
          <div className="flex items-center gap-3">
             <div className="text-[11px] font-bold">
               <p>(Bookingcode-lion)</p>
               <p>(Code-lain 1)</p>
               <p>(Code-lain 2)</p>
             </div>
             {/* Simple SVG QR Code Placeholder */}
             <div className="w-16 h-16 border-2 border-black p-1">
                <div className="w-full h-full bg-black flex flex-wrap gap-1 p-0.5">
                   <div className="w-3 h-3 bg-white" />
                   <div className="w-3 h-3 bg-white ml-auto" />
                   <div className="w-3 h-3 bg-white mt-auto" />
                </div>
             </div>
          </div>
        </div>

        {/* Footer Perhatian */}
        <div className="mt-8 pt-2 border-t-4 border-double border-zinc-800 text-center">
          <p className="font-bold uppercase tracking-widest text-[14px]">
            ================ PERHATIAN ================
          </p>
          <p className="mt-1 font-medium">Harap membuat video unboxing untuk memudahkan jika terdapat komplain</p>
          <p className="flex items-center justify-center gap-1 mt-1">
            Jika terdapat kendala dalam pesanan, harap hubungi Whatsapp 0821111211212
          </p>
        </div>

        {/* Garis Potong (Opsional) */}
        <div className="mt-10 border-t border-dashed border-zinc-600 relative print:hidden">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-zinc-600">
            <Scissors size={14} />
          </div>
        </div>
      </div>

      {/* CSS Khusus Print */}
      <style>{`
        @media print {
          body { background-color: white !important; }
          .min-h-screen { min-height: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}