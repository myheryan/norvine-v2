import Image from "next/image"
import Link from 'next/link'
import { useState } from 'react'
import { FiCopy, FiCheckCircle, FiTag, FiGift, FiInstagram } from 'react-icons/fi'
import { Zap } from "lucide-react"
import { Desktop, Mobile } from "@/components/responsive"

// --- Import Prisma ---
import prisma from '@/lib/prisma'

// --- 1. AMBIL DATA DARI DATABASE (Server Side) ---
export async function getServerSideProps() {
  try {
    const promosDb = await prisma.promo.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    const promos = promosDb.map((promo) => ({
      ...promo,
      startDate: promo.startDate ? promo.startDate.toISOString() : null,
      endDate: promo.endDate ? promo.endDate.toISOString() : null,
      createdAt: promo.createdAt.toISOString(),
    }));

    return {
      props: { promos },
    };
  } catch (error) {
    console.error("Gagal mengambil data promo:", error);
    return {
      props: { promos: [] },
    };
  }
}

// --- Helper Functions ---
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// --- 2. KOMPONEN UTAMA HALAMAN PROMO ---
export default function PromoPage({ promos }: { promos: any[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Fungsi render kupon
  const renderVouchers = (isMobile: boolean) => {
    if (!promos || promos.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white/50 rounded-2xl border border-white/40 shadow-sm">
           <FiTag className="text-slate-300 w-10 h-10 mb-2" />
           <p className="text-center text-slate-500 font-medium text-sm">Saat ini belum ada promo yang tersedia.</p>
        </div>
      );
    }





    return promos.map((voucher) => {
      // 1. CEK STATUS KADALUWARSA
      const now = new Date();
      const isNotStarted = voucher.startDate ? new Date(voucher.startDate) > now : false;
      const isExpired = (voucher.endDate ? new Date(voucher.endDate) < now : false) || (voucher.used >= voucher.limit);
      const isUsable = !isNotStarted && !isExpired;

      // 2. LOGIKA DISKON (Percent / Fixed)
      const isPercentage = voucher.type === "PERCENT";
      const discountText = isPercentage ? `${voucher.value}% OFF` : formatRupiah(voucher.value);

      // 3. TEKS DESKRIPSI
      let descText = `Nikmati potongan harga ${isPercentage ? 'sebesar ' + voucher.value + '%' : discountText}.`;
      if (voucher.minOrder > 0) descText += ` Min. transaksi ${formatRupiah(voucher.minOrder)}.`;
      if (voucher.maxDiscount) descText += ` Max. potongan ${formatRupiah(voucher.maxDiscount)}.`;

      // 4. TEKS MASA BERLAKU
      let validityText = "";
      if (voucher.startDate && voucher.endDate) {
        validityText = `${formatDate(voucher.startDate)} - ${formatDate(voucher.endDate)}`;
      } else if (voucher.endDate) {
        validityText = `Berakhir: ${formatDate(voucher.endDate)}`;
      } else {
        validityText = "Selama Kuota Ada";
      }

      return (
        <div key={voucher.id} className={cn(
          "group bg-white/90 backdrop-blur-md rounded-2xl flex flex-col shadow-sm border border-white/50 overflow-hidden transform transition-all duration-300",
          isUsable ? "hover:shadow-md hover:-translate-y-1" : "opacity-75 grayscale-[20%]"
        )}>
          
          {/* --- HEADER KUPON --- */}
          <div className={cn(
            "text-white p-4 relative border-b-2 border-dashed border-slate-500/50",
            isUsable ? "bg-gradient-to-r from-[#1D1E20] to-[#3A3C40]" : "bg-gradient-to-r from-slate-500 to-slate-600"
          )}>
            
            {/* Badge Flash Sale & Status Kadaluwarsa */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1">    
              {!isUsable && (
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-100 border border-red-500/30">
                  {isNotStarted ? 'Belum Mulai' : 'Habis / Kedaluwarsa'}
                </span>
              )}
            </div>

            {/* Aksen Bolong Kupon Kiri Kanan */}
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#DDDDDD] rounded-full shadow-inner z-10"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#DDDDDD] rounded-full shadow-inner z-10"></div>
            
            <div className="flex justify-between items-start mt-2">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                  Nilai Promo
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold mt-1.5 tracking-tight text-white drop-shadow-sm">
                  {discountText}
                </h3>
              </div>
            </div>
          </div>
          
          {/* --- BODY KUPON --- */}
          <div className="p-4 md:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50">
            <div className="mb-4">
              <h4 className="font-bold text-slate-800 text-sm md:text-base mb-1 group-hover:text-blue-600 transition-colors">
                {voucher.name}
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px] md:text-xs">
                {descText}
              </p>
            </div>
            
            <div className="space-y-3 relative z-20">
              <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200">
                <span className={cn(
                  "font-mono font-bold tracking-wider text-xs md:text-sm ml-1",
                  isUsable ? "text-slate-800" : "text-slate-400 line-through"
                )}>
                  {voucher.code}
                </span>
                <button 
                  onClick={() => isUsable && handleCopy(voucher.code)}
                  disabled={!isUsable}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-bold text-[10px] md:text-xs uppercase",
                    !isUsable 
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : copiedCode === voucher.code 
                        ? "bg-emerald-100 text-emerald-700 shadow-sm" 
                        : "bg-[#1D1E20] text-white hover:bg-black active:scale-95 shadow-sm hover:shadow-md"
                  )}
                >
                  {copiedCode === voucher.code ? <><FiCheckCircle size={12}/> Disalin</> : <><FiCopy size={12}/> Salin</>}
                </button>
              </div>
              
              {/* Info Kuota & Masa Berlaku */}
              <div className="flex items-center justify-between text-[9px] md:text-[10px] font-medium px-1">
                <p className={cn("text-slate-500", voucher.used >= voucher.limit && "text-red-500 font-bold")}>
                  Terpakai: {voucher.used}/{voucher.limit}
                </p>
                <p className="text-slate-500 text-right">
                  Berlaku: <span className="text-slate-700 font-semibold">{validityText}</span>
                </p>
              </div>

            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Desktop>
        <div className="relative min-h-screen w-full pt-8 pb-16 overflow-hidden">
          {/* --- BACKGROUNDS --- */}
          <div className="absolute top-0 left-0 -z-40 h-full w-full bg-[#DDDDDD] "></div>
          <div className="absolute -left-10 top-10 -z-30 h-full w-1/3 ">
            <Image priority src="/find-us/all-variant.webp" alt="All variant background" className="object-contain" draggable={false} fill={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
          </div>
          <div className="absolute right-0 bottom-0 -z-30 h-screen w-5/6 opacity-20 ">
            <Image priority src="/promo/promotion-hologram-background.webp" alt="Hologram background" className="object-contain" draggable={false} fill={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
          </div>
          <div className="relative z-10 flex w-full max-w-[1000px] mx-auto flex-col items-center justify-start space-y-10">
            <div className="flex flex-row gap-5 w-full px-4">
              <div className="flex-1 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow flex flex-row items-center gap-4 text-left">
                <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center p-3 shadow-inner">
                   <Image src="/promo/promotion.png" alt="Promotion" width={60} height={60} className="object-cover drop-shadow-sm" draggable={false} />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-1 text-[#1D1E20]">Dapatkan promo terbaru!</h2>
                  <p className="text-slate-600 mb-2 text-xs leading-relaxed">Ikuti Instagram kami untuk update promo & campaign setiap bulan.</p>
                  <a href="https://www.instagram.com/norvine.id/" rel="noreferrer noopener" target="_blank" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full font-semibold hover:opacity-90 transition-opacity text-xs shadow-sm">
                    <FiInstagram size={14} /> @Norvine.id
                  </a>
                </div>
              </div>

              <div className="flex-1 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow flex flex-row items-center gap-4 text-left">
                <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 flex items-center justify-center p-3 shadow-inner">
                   <Image src="/promo/customer-loyalty.png" alt="Loyalty" width={60} height={60} className="object-cover drop-shadow-sm" draggable={false} />
                </div>
                <div className="flex flex-col h-full justify-center">
                  <h2 className="text-lg font-bold mb-1 text-[#1D1E20]">Loyal Customer Program</h2>
                  <p className="text-slate-600 text-xs leading-relaxed mb-1">
                    <span className="text-blue-500 font-bold">•</span> Kumpulkan serial number hologram.<br/>
                    <span className="text-blue-500 font-bold">•</span> Redeem 10 SN untuk merchandise.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Isi form <Link href="/#contact-us" className="text-blue-600 font-bold hover:underline">Contact-us</Link> untuk redeem
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full px-4">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 border border-white text-slate-700 text-[10px] font-bold uppercase tracking-widest mb-3 shadow-sm">
                   <FiGift /> Semua Voucher
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1E20]">
                  Voucher & Potongan Harga
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {renderVouchers(false)}
              </div>
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <div className="relative min-h-screen w-full snap-start pt-4 pb-8 overflow-hidden">
          {/* --- BACKGROUNDS MOBILE --- */}
          <div className="absolute top-0 left-0 -z-40 h-full w-full bg-[#DDDDDD]"></div>
          <div className="absolute left-0 top-10 -z-30 h-full w-full opacity-20">
            <Image src="/find-us/all-variant.webp" alt="Composition background" className="object-contain" draggable={false} fill />
          </div>


          <div className="relative z-10 mx-5 flex flex-col items-center justify-start space-y-8">
            <div className="flex flex-col space-y-6 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-sm w-full">
              <div className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center p-2.5 shadow-inner">
                  <Image src="/promo/promotion.png" alt="Promotion" width={50} height={50} className="object-cover" draggable={false} />
                </div>
                <div>
                  <h1 className="text-base font-bold mb-1 text-[#1D1E20]">Promo terbaru!</h1>
                  <p className="text-[11px] text-[#1D1E20] leading-snug mb-2">Ikuti sosial media kami dan dapatkan promo menarik.</p>
                  <a href="https://www.instagram.com/norvine.id/" rel="noreferrer noopener" target="_blank" className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-1 rounded-full text-[10px] font-semibold">
                    <FiInstagram size={12} /> @Norvine.id
                  </a>
                </div>
              </div>

              <div className="w-full h-[1px] bg-slate-300/50"></div>

              <div className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 flex items-center justify-center p-2.5 shadow-inner">
                  <Image src="/promo/customer-loyalty.png" alt="Customer Loyalty" width={50} height={50} className="object-cover" draggable={false} />
                </div>
                <div>
                  <h1 className="text-base font-bold mb-1 text-[#1D1E20]">Loyal customer!</h1>
                  <div className="text-[11px] text-[#1D1E20] leading-snug">
                    <p>• Kumpulkan SN hologram</p>
                    <p>• Redeem 10 SN untuk merchandise</p>
                  </div>
                  <p className="text-[9px] mt-1.5 text-slate-500">
                    *Isi form <Link href="/#contact-us" className="text-blue-600 font-bold">Contact-us</Link> untuk redeem
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold tracking-tight text-[#1D1E20] flex items-center justify-center gap-2">
                  <FiTag /> Semua Voucher
                </h2>
              </div>
              <div className="flex flex-col space-y-4">
                {renderVouchers(true)}
              </div>
            </div>
          </div>
        </div>
      </Mobile>
    </>
  )
}

// Menambahkan utility class untuk mempermudah
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}