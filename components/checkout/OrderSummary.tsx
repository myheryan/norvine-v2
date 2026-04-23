"use client"

import { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown, FiCheckCircle, FiAlertCircle, FiLoader, FiTruck, FiChevronRight, FiCreditCard } from 'react-icons/fi'
import { formatRp, cn } from '@/lib/utils'
import { FiTagIcon } from '../icons'

interface SummaryProps {
  options: { shipping: string; payment: string };
  setOptions: React.Dispatch<React.SetStateAction<{ shipping: string; payment: string }>>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  insuranceCost: number;
  serviceFee: number;
  total: number;
  isSubmitting: boolean;
  isCheckingShipping: boolean;
  selectedRate: any;
  isCheckoutDisabled: boolean;
  setOrderData: React.Dispatch<React.SetStateAction<any>>;
  setIsModalOpen: (open: boolean) => void;
  appliedPromo?: { code: string | null; name?: string };
}

// Shimmer yang selaras dengan warna zinc-50 OrderItems
const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-zinc-100/80", className)} />
)

export default function OrderSummary({ 
  options, 
  setOptions, 
  subtotal, 
  discount, 
  shippingCost, 
  insuranceCost,
  serviceFee,
  total,
  isSubmitting,
  isCheckingShipping,
  selectedRate,
  isCheckoutDisabled,
  setIsModalOpen,
  appliedPromo
}: SummaryProps) {
  const [showDetails, setShowDetails] = useState(true);  
  const [hasPendingOrder, setHasPendingOrder] = useState<string | null>(null);

  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await fetch('/api/user/check-pending');
        const data = await res.json();
        if (data.hasPending) setHasPendingOrder(data.invoice);
      } catch (e) { console.error(e); }
    };
    checkPending();
  }, []);

  const gateways = [
    {
      title: 'Transfer Bank (Midtrans)',
      methods: [
        { id: 'bca_va', label: 'BCA Virtual Account', icon: 'BCA' },
        { id: 'qris', label: 'QRIS / Midtrans', icon: 'QRIS' },
      ]
    }
  ];

  return (
    <div className="w-full lg:w-[400px] shrink-0 space-y-4 lg:sticky lg:top-8">
      
      {/* 1. METODE PEMBAYARAN - Mengikuti Header OrderItems */}
      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
        <div className="bg-zinc-50/50 p-4 border-b border-zinc-100">
          <h3 className="text-sm font-black text-zinc-600 flex items-center gap-2">
            <FiCreditCard size={16} /> Metode Pembayaran
          </h3>
        </div>
        
        <div className="p-4 space-y-5">
          {gateways.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">{group.title}</p>
              <div className="space-y-3">
                {group.methods.map((method) => (
                  <label key={method.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-7 border flex items-center justify-center text-[9px] italic transition-all",
                        options.payment === method.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 border-zinc-100 text-zinc-800"
                      )}>
                        {method.icon}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        options.payment === method.id ? "font-bold text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"
                      )}>
                        {method.label}
                      </span>
                    </div>
                    <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                        options.payment === method.id ? "border-zinc-900 bg-zinc-900" : "border-zinc-200"
                    )}>
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={options.payment === method.id} 
                        onChange={() => setOptions({ ...options, payment: method.id })}
                        className="hidden"
                      />
                      {options.payment === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RINGKASAN TRANSAKSI */}
      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
        <div className="bg-zinc-50/50 p-4 border-b border-zinc-100">
           <h3 className="text-sm font-black text-zinc-600 flex items-center gap-2">Ringkasan Transaksi</h3>
        </div>

        {/* Promo Section - Mirroring Catatan Style */}
        <div className="p-4 border-b border-zinc-50 bg-zinc-50/30">
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full flex items-center justify-between p-3 border transition-all",
              discount > 0 ? "border-zinc-900 bg-white" : "border-zinc-100 bg-white hover:border-zinc-300"
            )}
          >
            <div className="flex items-center gap-3">
              <FiTagIcon size={18} />
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900">
                  {discount > 0 ? 'Promo Berhasil Dipasang' : 'Punya Kode Promo?'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {discount > 0 ? (appliedPromo?.code || 'DISKON') : 'Klik untuk masukan voucher'}
                </p>
              </div>
            </div>
            <FiChevronRight className="text-zinc-300" size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">Total Harga Produk</span>
            <span className="font-bold text-zinc-900">{formatRp(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm items-center">
            <span className="text-zinc-600">Ongkos Kirim</span>
            {isCheckingShipping ? (
              <Shimmer className="h-4 w-20" />
            ) : !selectedRate ? (
              <span className="text-xs text-zinc-300 italic">Menunggu alamat...</span>
            ) : (
              <span className="font-bold text-zinc-900">{formatRp(shippingCost)}</span>
            )}
          </div>

          <div className="pt-2">
            <button 
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <span>Rincian Biaya</span>
              {showDetails ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {showDetails && (
              <div className="mt-3 space-y-2 border-l-2 border-zinc-100 pl-4 animate-in slide-in-from-top-1 duration-200">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Biaya Layanan</span>
                  <span>{formatRp(serviceFee)}</span>
                </div>
                {insuranceCost > 0 && (
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Asuransi</span>
                    <span>{formatRp(insuranceCost)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Potongan Promo</span>
                    <span>-{formatRp(discount)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TOTAL & ACTION */}
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <div className="flex justify-between items-end mb-6">
              <span className="text-xs font-black text-zinc-600 uppercase">Total Tagihan</span>
              {isCheckingShipping ? (
                <Shimmer className="h-8 w-32" />
              ) : (
                <span className="text-xl font-black text-zinc-900 tracking-tight">
                  {formatRp(total)}
                </span>
              )}
            </div>
            
            {/* ALERT SECTION */}
            <div className="mb-4">
              {hasPendingOrder ? (
                <div className="p-3 bg-red-50 border border-red-100 flex items-center gap-3">
                  <FiAlertCircle className="text-red-500 shrink-0" size={16} />
                  <p className="text-[11px] text-red-600 leading-tight">
                    Selesaikan pembayaran <strong>#{hasPendingOrder}</strong> sebelum membuat pesanan baru.
                  </p>
                </div>
              ) : isCheckingShipping ? (
                <div className="p-3 bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <FiLoader className="text-zinc-400 animate-spin" size={14} />
                  <span className="text-xs text-zinc-400">Sinkronisasi biaya...</span>
                </div>
              ) : !selectedRate ? (
                <div className="p-3 bg-amber-50 border border-amber-100 flex items-center gap-3">
                  <FiTruck className="text-amber-600" size={16} />
                  <span className="text-xs text-amber-700 font-semibold">Pilih Alamat & Kurir</span>
                </div>
              ) : null}
            </div>

            <button 
              type="submit"
              disabled={isCheckoutDisabled}
              className={cn(
                "w-full py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                (isCheckingShipping || !selectedRate || !!hasPendingOrder) 
                  ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
                  : "bg-zinc-900 text-white hover:bg-black active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <>
                  <FiCheckCircle size={18}/>
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}