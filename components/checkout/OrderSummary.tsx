"use client"

import { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown, FiCheckCircle, FiAlertCircle, FiLoader, FiTruck, FiChevronRight } from 'react-icons/fi'
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

// Komponen Shimmer untuk efek loading angka yang mulus
const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-zinc-100 rounded-none", className)} />
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
      title: 'Transfer Bank (Layanan Midtrans)',
      methods: [
        { id: 'bca_va', label: 'BCA Virtual Account', icon: 'BCA' },
        { id: 'qris', label: 'QRIS / Midtrans', icon: 'QRIS' },
      ]
    }
  ];

  return (
    <div className="w-full lg:w-[400px] shrink-0 space-y-3 lg:sticky lg:top-8">
      
      {/* SECTION 1: METODE PEMBAYARAN - Style samakan dengan Card Alamat/OrderItems */}
      <div className="bg-white p-6 border border-zinc-100 shadow-sm rounded-none">
        <h3 className="text-[11px] font-bold text-zinc-900 mb-5 uppercase tracking-[0.2em]">Metode Pembayaran</h3>
        <div className="space-y-6">
          {gateways.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-normal">{group.title}</p>
              <div className="space-y-4">
                {group.methods.map((method) => (
                  <label key={method.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-7 border flex items-center justify-center text-[9px] italic transition-all rounded-none",
                        options.payment === method.id ? "bg-black text-white border-black" : "bg-zinc-50 border-zinc-100 text-zinc-800"
                      )}>
                        {method.icon}
                      </div>
                      <span className={cn(
                        "text-[11px] uppercase tracking-tight transition-colors",
                        options.payment === method.id ? "text-black font-bold" : "text-zinc-500 group-hover:text-zinc-900"
                      )}>
                        {method.label}
                      </span>
                    </div>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      checked={options.payment === method.id} 
                      onChange={() => setOptions({ ...options, payment: method.id })}
                      className="w-4 h-4 accent-black"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PROMO & RINGKASAN */}
      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden rounded-none">
        {/* Promo Bar */}
        <div className="p-4 bg-zinc-50/50 border-b border-zinc-100">
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full flex items-center justify-between p-3 border transition-all rounded-none",
              discount > 0 ? "border-black bg-white" : "border-zinc-200 bg-white hover:border-black"
            )}
          >
            <div className="flex items-center gap-3">
              <FiTagIcon size={18} />
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest leading-none mb-1">
                  {discount > 0 ? 'Promo Terpasang' : 'Gunakan Promo'}
                </span>
                <span className="text-[9px] text-zinc-500 tracking-tighter uppercase">
                  {discount > 0 ? (appliedPromo?.code || 'Diskon Berhasil') : 'Klik untuk lihat voucher'}
                </span>
              </div>
            </div>
            <FiChevronRight className="text-zinc-300" size={16} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-[11px] font-bold text-zinc-900 mb-5 uppercase tracking-[0.2em]">Ringkasan Transaksi</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-[11px] uppercase tracking-tighter">
              <span className="text-zinc-400">Subtotal Produk</span>
              <span className="text-zinc-900 font-medium">{formatRp(subtotal)}</span>
            </div>

            {/* Ongkos Kirim dengan Shimmer */}
            <div className="flex justify-between text-[11px] uppercase tracking-tighter items-center">
              <span className="text-zinc-400">Pengiriman</span>
              {isCheckingShipping ? (
                <Shimmer className="h-4 w-20" />
              ) : !selectedRate ? (
                <span className="text-zinc-300 italic tracking-normal lowercase">menunggu alamat...</span>
              ) : (
                <span className="text-zinc-900 font-medium">{formatRp(shippingCost)}</span>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-zinc-400 hover:text-black transition-colors text-[10px] uppercase font-bold tracking-widest"
              >
                <span>Rincian Biaya</span>
                {showDetails ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {showDetails && (
                <div className="mt-4 space-y-3 border-l-2 border-zinc-900 pl-4 animate-in slide-in-from-top-1 duration-300">
                  {insuranceCost > 0 && (
                    <div className="flex justify-between text-[11px] uppercase text-zinc-500">
                      <span>Asuransi Pengiriman</span>
                      <span>{formatRp(insuranceCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] uppercase text-zinc-500">
                    <span>Biaya Layanan</span>
                    <span>{formatRp(serviceFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[11px] uppercase text-[#00bfa5] font-bold">
                      <span>Potongan Promo</span>
                      <span>-{formatRp(discount)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100">
            {/* Total dengan Shimmer */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] uppercase text-zinc-400 font-bold tracking-[0.2em]">Total Tagihan</span>
              {isCheckingShipping ? (
                <Shimmer className="h-7 w-32" />
              ) : !selectedRate ? (
                <span className="text-lg font-bold text-zinc-200 tracking-tighter">---</span>
              ) : (
                <span className="text-xl font-bold text-zinc-900 tracking-tighter">
                  {formatRp(total)}
                </span>
              )}
            </div>
            
            {/* ALERT AREA */}
            <div className="mb-4">
              {hasPendingOrder ? (
                <div className="p-3 bg-rose-50 border border-rose-100 flex items-start gap-3">
                  <FiAlertCircle className="text-rose-600 mt-0.5 shrink-0" size={14} />
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">Bayar Tagihan Dahulu</p>
                    <p className="text-[9px] text-rose-500 uppercase">Selesaikan #{hasPendingOrder}</p>
                  </div>
                </div>
              ) : isCheckingShipping ? (
                <div className="p-3 bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <FiLoader className="text-zinc-400 animate-spin" size={14} />
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Sinkronisasi...</span>
                </div>
              ) : !selectedRate ? (
                <div className="p-3 bg-amber-50 border border-amber-100 flex items-center gap-3">
                  <FiTruck className="text-amber-600" size={14} />
                  <span className="text-[10px] text-amber-700 uppercase tracking-widest font-bold">Pilih Alamat</span>
                </div>
              ) : null}
            </div>

            <button 
              type="submit"
              disabled={isCheckoutDisabled}
              className={cn(
                "w-full py-4 font-bold text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all rounded-none",
                (isCheckingShipping || !selectedRate || !!hasPendingOrder) 
                  ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
                  : "bg-zinc-900 text-white hover:bg-black active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <FiLoader className="animate-spin" size={16} />
              ) : isCheckingShipping ? (
                "Loading..."
              ) : !selectedRate ? (
                "Lengkapi Data"
              ) : (
                <>
                  <FiCheckCircle size={16}/>
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