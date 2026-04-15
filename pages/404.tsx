import React from "react";
import Link from "next/link";
import Head from "next/head";
import { FiArrowLeft, FiShoppingBag, FiSearch } from "react-icons/fi";

export default function Custom404() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans selection:bg-black selection:text-white">
      <Head>
        <title>404 - Halaman Tidak Ditemukan | Norvine</title>
      </Head>

      {/* BACKGROUND DECOR (Optional - Minimalist Text) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <h1 className="text-[20vw] font-black tracking-tighter">NORVINE</h1>
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* BIG ERROR CODE */}
        <h2 className="text-[120px] md:text-[150px] font-black leading-none tracking-tighter text-black">
          404
        </h2>
        
        <div className="mt-4 space-y-2">
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-black">
            Oops! Halaman Hilang
          </h3>
          <p className="text-zinc-500 text-sm md:text-base font-normal leading-relaxed">
            Sepertinya halaman yang Anda cari telah berpindah tempat atau tidak lagi tersedia di koleksi kami.
          </p>
        </div>

        {/* SEARCH BAR MINI (Optional but helpful) */}
        <div className="mt-10 relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Cari produk lain..." 
            className="w-full h-12 pl-11 pr-4 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black focus:bg-white transition-all text-sm"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link 
            href="/" 
            className="flex-1 h-13 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 py-4"
          >
            <FiArrowLeft size={16} />
            Kembali Beranda
          </Link>
          
          <Link 
            href="/shop" 
            className="flex-1 h-13 bg-white text-black border border-black text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all active:scale-95 py-4"
          >
            <FiShoppingBag size={16} />
            Belanja Sekarang
          </Link>
        </div>

        {/* FOOTER LINKS */}
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">Butuh Bantuan?</p>
          <div className="flex justify-center gap-6 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            <Link href="/contact" className="hover:text-black transition-colors">Kontak Kami</Link>
            <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
            <Link href="/shipping" className="hover:text-black transition-colors">Pengiriman</Link>
          </div>
        </div>
      </div>
    </div>
  );
}