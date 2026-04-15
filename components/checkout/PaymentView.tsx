"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'sonner'
import { FiChevronDown, FiArrowLeft, FiLoader } from 'react-icons/fi'
import { formatRp } from '@/lib/utils'
import { ClipboardCopy } from 'lucide-react'
import Image from 'next/image'

interface PaymentViewProps {
  paymentData: any;
}

export default function PaymentView({ paymentData }: PaymentViewProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState('00 jam 00 menit 00 detik')
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // --- NORMALISASI DATA ---
  const transaction = paymentData?.transaction || paymentData;

  if (!transaction || typeof transaction !== 'object') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <FiLoader className="animate-spin text-zinc-300" size={24} />
      </div>
    );
  }

  const vaNumber = transaction?.vaNumber || transaction?.paymentCode || "-";
  const bankName = transaction?.bankName?.toLowerCase() || 'bank';
  const qrUrl = transaction?.qrUrl; // Tambahkan field QR
  const expiryDate = transaction?.paymentExpiry;
  const invoiceId = transaction?.invoice;
  const createdAt = transaction?.createdAt;
  const totalAmount = transaction?.totalAmount || 0;

  // --- LOGIKA REAL-TIME POLLING ---
  useEffect(() => {
    if (!invoiceId) return;
    const checkPaymentStatus = async () => {
      try {
        setIsChecking(true);
        const res = await fetch(`/api/orders/status/${invoiceId}`);
        const data = await res.json();
        const successStatuses = ['PAID', 'SETTLEMENT', 'SUCCESS'];
        if (successStatuses.includes(data?.status)) {
          toast.success("Pembayaran Berhasil");
          setTimeout(() => router.push(`/user/orders/${invoiceId}`), 1500);
        }
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        setIsChecking(false);
      }
    };
    const interval = setInterval(checkPaymentStatus, 10000);
    return () => clearInterval(interval);
  }, [invoiceId, router]);

  // --- LOGIKA COUNTDOWN TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(expiryDate || new Date(createdAt).getTime() + 86400000).getTime();
      const diff = end - now;
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft("Waktu Habis");
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${h} jam ${m} menit ${s} detik`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryDate, createdAt]);

  const handleCopy = () => {
    if (vaNumber === "-") return;
    navigator.clipboard.writeText(vaNumber);
    toast.success("Nomor rekening disalin");
  };

  return (
    <div className="bg-white w-full flex flex-col items-center justify-center border border-gray-200 max-w-4xl shadow-sm md:m-4 antialiased text-gray-700 mx-auto">
      
      {/* Header */}
      <div className="w-full flex items-center gap-4 p-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-normal">Pembayaran</h1>
      </div>

      <div className="w-full max-w-2xl p-8 space-y-8">
        
        {/* KONDISIONAL: QRIS ATAU VA */}
        {qrUrl ? (
          /* TIPE PEMBAYARAN QRIS */
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                QR
              </div>
              <span className="text-base font-bold text-gray-700 capitalize">QRIS / QR Payment</span>
            </div>
            
            <div className="p-4 border border-gray-100 bg-white shadow-sm inline-block">
              <Image 
                src={qrUrl} 
                alt="QRIS" 
                width={300} 
                height={300} 
                className="mx-auto object-contain"
                priority
              />
            </div>
            <p className="text-xs text-gray-400 text-center uppercase tracking-widest">Scan kode di atas untuk membayar</p>
          </div>
        ) : (
          /* TIPE PEMBAYARAN VA (Original Style) */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-900 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                {bankName.substring(0, 3)}
              </div>
              <span className="text-base font-bold text-gray-700 capitalize">Bank {bankName}</span>
            </div>

            <div className="md:pl-11">
              <p className="text-gray-600 text-[11px] mb-3 uppercase tracking-wider">Virtual Account Number</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-normal text-emerald-600 tracking-tight">
                  {vaNumber}
                </span>
                <button onClick={handleCopy} className="text-cyan-500 hover:text-cyan-600">
                  <ClipboardCopy size={16}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Summary */}
        <div className="space-y-3 py-6 border-y border-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-medium">No. Pesanan</span>
            <span className="text-gray-800 tracking-wider uppercase font-semibold">{invoiceId || "-"}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-medium">Total Pembayaran</span>
            <span className="text-xl font-normal text-emerald-600">{formatRp(totalAmount)}</span>
          </div>

          <div className="flex justify-between items-start pt-2">
            <span className="text-sm text-gray-400 font-medium">Bayar Dalam</span>
            <div className="text-right">
              <p className="text-sm text-orange-600 font-mono font-bold">{timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Payment Guide Tabs */}
        <div className="space-y-1">
          {/* Instruksi dinamis berdasarkan tipe pembayaran */}
          {(qrUrl ? ['Cara Bayar QRIS'] : ['mBanking', 'iBanking', 'ATM']).map((method) => (
            <div key={method} className="border-b border-gray-50 last:border-0">
              <button 
                onClick={() => setActiveTab(activeTab === method ? null : method)}
                className="w-full flex justify-between items-center py-3 text-sm text-gray-600"
              >
                <span>Petunjuk {qrUrl ? 'Pembayaran' : `Transfer ${method}`}</span>
                <FiChevronDown className={`transition-transform duration-300 ${activeTab === method ? 'rotate-180' : ''}`} />
              </button>
              {activeTab === method && (
                <div className="pb-6 px-2 text-xs text-gray-500 space-y-2 leading-relaxed font-medium">
                  {qrUrl ? (
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Buka aplikasi pembayaran (Gopay, ShopeePay, Dana, OVO, dll)</li>
                      <li>Pilih menu "Scan" atau "Bayar"</li>
                      <li>Scan kode QR yang tampil di layar</li>
                      <li>Pastikan jumlah {formatRp(totalAmount)} sudah sesuai</li>
                      <li>Selesaikan transaksi pada aplikasi Anda</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Buka aplikasi {method} Anda</li>
                      <li>Pilih Transfer ke Virtual Account</li>
                      <li>Masukkan Nomor VA: {vaNumber}</li>
                      <li>Pastikan nominal sesuai: {formatRp(totalAmount)}</li>
                    </ol>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Polling Loader */}
        <div className="flex items-center justify-center gap-2 py-4">
          <FiLoader className={`${isChecking ? 'animate-spin' : ''} text-orange-500`} size={14} />
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
            Menunggu konfirmasi otomatis
          </span>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => router.push('/user/orders')}
          className="w-full py-4 bg-zinc-950 text-white text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-zinc-800 transition-all rounded-full shadow-md"
        >
          Cek Status Pesanan
        </button>

      </div>
    </div>
  )
}