"use client"

import { useState } from 'react'
import Image from "next/image"
import { cn, formatRp, getCloudinaryImage } from '@/lib/utils'
import { FiTruck, FiChevronDown, FiCheck, FiEdit3, FiShield, FiLoader, FiAlertCircle } from 'react-icons/fi'

interface OrderItemsProps {
  items: any[];
  options: { shipping: string; payment: string };
  setOptions: (opt: any) => void;
  shippingData: { 
    active: boolean; 
    services: any[]; 
  };
  isCheckingShipping: boolean;
  notes: string;
  setNotes: (val: string) => void;
  useInsurance: boolean;
  setUseInsurance: (val: boolean) => void;
  shippingErrorMessage?: string;
}

export default function OrderItems({ 
  items, 
  options, 
  setOptions, 
  shippingData, 
  isCheckingShipping,
  shippingErrorMessage,
  notes,
  setNotes,
  useInsurance,
  setUseInsurance
}: OrderItemsProps) {
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Variabel pengecekan layanan kurir
  const isShippingAvailable = shippingData.services.length > 0;
  const selectedService = shippingData.services.find(s => s.product === options.shipping);
  console.log(shippingData

  )
  
  return (
    <div className="bg-white border border-zinc-100 shadow-sm overflow-visible relative z-20">
      
      {/* 1. HEADER TABEL (DESKTOP) */}
      <div className="hidden md:grid grid-cols-12 gap-2 bg-zinc-50/50 p-4 border-b border-zinc-100 text-sm font-black text-zinc-600 ">
        <div className="col-span-6">Produk Dipesan</div>
        <div className="col-span-2 text-center">Harga</div>
        <div className="col-span-2 text-center">Jumlah</div>
        <div className="col-span-2 text-right">Subtotal</div>
      </div>

      {/* 2. DAFTAR PRODUK */}
      <div className="divide-y divide-zinc-50">
        {items.map((item) => (
          <div key={`${item.productId}_${item.variantId}`} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 items-center">
            <div className="flex gap-2 w-full md:col-span-6 items-center">
              <div className="w-16 h-16 border border-zinc-100 relative shrink-0 bg-zinc-50 overflow-hidden">
                <Image 
                  src={getCloudinaryImage(item.variantImageUrl || item.thumbnailUrl, 150, 150)} 
                  alt={item.name} 
                  fill 
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-zinc-900">{item.name}</h4>
                <p className="text-xs text-zinc-600 mt-1">Varian: {item.variant}</p>
                <div className="md:hidden mt-2 flex justify-between items-end">
                   <p className="text-sm text-zinc-600">{formatRp(item.price)} <span className='text-zinc-900 ml-1'> x{item.quantity}</span></p>
                   <p className="text-sm font-black text-zinc-900">{formatRp(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block col-span-2 text-center text-xs text-zinc-600">{formatRp(item.price)}</div>
            <div className="hidden md:block col-span-2 text-center text-sm font-bold text-zinc-900">{item.quantity}</div>
            <div className="hidden md:block col-span-2 text-right text-sm font-black text-zinc-900">{formatRp(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      {/* 3. FOOTER: CATATAN & PENGIRIMAN */}
      <div className="bg-zinc-50/30 border-t border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
          
          <div className="p-4 flex items-start gap-3 group">
            <div className="mt-1 text-zinc-300 group-focus-within:text-emerald-600 transition-colors">
              <FiEdit3 size={18} />
            </div>
            <div className="flex-1">
              <label className="text-sm text-zinc-600 block mb-1">Catatan Pesanan</label>
              <textarea 
                rows={1}
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Tulis pesan..." 
                className="w-full text-sm bg-transparent border-none outline-none placeholder-zinc-300 text-zinc-700 resize-none p-0 focus:ring-0" 
              />
            </div>
          </div>

          <div className="p-4 bg-white md:bg-transparent">
            <div className="flex justify-between items-center mb-2">
              <div className={`flex items-center gap-2 ${isShippingAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                <FiTruck size={16} />
                <span className="text-sm font-semibold">Metode Pengiriman</span>
              </div>
              {isCheckingShipping && <FiLoader className="animate-spin text-zinc-300" size={14} />}
            </div>

            <div className="relative">

              <button 
                type="button"
                disabled={!isShippingAvailable || isCheckingShipping}
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                className={`w-full flex items-center justify-between p-3 border transition-all text-left ${
                  !isShippingAvailable ? 'bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed' :
                  isShippingOpen ? 'border-zinc-900 bg-white ring-4 ring-zinc-50' : 'border-zinc-100 bg-white hover:border-zinc-300'
                }`}
              >
                {selectedService ? (
                  <div className="flex-1">
                    <div className="flex justify-between items-center pr-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-zinc-900 uppercase font-semibold">{selectedService.product}</span>
                        <span className="text-[9px] text-emerald-600 font-bold uppercase">{selectedService.status}</span>
                      </div>
                      <span className="text-xs text-zinc-900 font-bold">{formatRp(selectedService.total_tariff)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-600">
                    {isCheckingShipping ? 'Mengecek Ongkir...' : 'Pilih Layanan Kurir'}
                  </span>
                )}
                <FiChevronDown className={`text-zinc-600 transition-transform ${isShippingOpen ? 'rotate-180' : ''}`} size={16} />
              </button>
                              {/* PESAN ERROR JIKA LAYANAN 0 */}
                {shippingData.services.length === 0 && !isCheckingShipping && (
                  <div className="mb-2 p-3 flex gap-2 text-red-500">
                    <FiAlertCircle size={14} />
                    <span className="text-[12px]  tracking-tight">
                      * {shippingErrorMessage || "Layanan ekspedisi tidak tersedia"}
                    </span>
                  </div>
                )}

              {isShippingOpen && isShippingAvailable && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setIsShippingOpen(false)} />
                  <div className="absolute bottom-full mb-2 md:bottom-auto md:top-[110%] left-0 right-0 z-[110] bg-white border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="max-h-[200px] overflow-y-auto divide-y divide-zinc-50">
                      {shippingData.services.map((svc: any) => {
                        const isActive = svc.status === 'ACTIVE';
                        return (
                          <button
                            key={svc.product}
                            type="button"
                            disabled={!isActive}
                            onClick={() => {
                              if (isActive) {
                                setOptions({ ...options, shipping: svc.product });
                                setIsShippingOpen(false);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-4 transition-all text-left ${
                              !isActive ? 'opacity-40 bg-zinc-50 cursor-not-allowed' : 'hover:bg-zinc-50'
                            } ${options.shipping === svc.product ? 'bg-zinc-50' : ''}`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-900 font-semibold">{svc.product}</p>
                                <span className={`text-[10px] px-1 border ${isActive ? 'text-emerald-600 border-emerald-600' : 'text-zinc-600 border-zinc-300'} rounded-md`}>
                                  {svc.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-600">Estimasi {svc.estimasi_sla}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold ${isActive ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                {formatRp(svc.total_tariff)}
                              </span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${options.shipping === svc.product ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200'}`}>
                                {options.shipping === svc.product && <FiCheck className="text-white" size={10} />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

<div 
  onClick={() => setUseInsurance(!useInsurance)}
  className={cn(
    "p-4 border transition-all flex items-center justify-between cursor-pointer select-none",
    useInsurance 
      ? "border-black bg-zinc-50" 
      : "border-zinc-200 bg-white"
  )}
>
  <div className="flex items-center gap-4">
    <div className={cn(
      "transition-colors",
      useInsurance ? "text-black" : "text-zinc-300"
    )}>
      <FiShield size={20} />
    </div>
    <div className="space-y-0.5">
      <h4 className="text-sm font-bold text-black uppercase tracking-tight">Asuransi Pengiriman</h4>
      <p className="text-[11px] text-zinc-500 leading-tight">
        Proteksi penuh dari kerusakan & kehilangan barang
      </p>
    </div>
  </div>

  {/* Custom Checkbox Sharp Edge */}
  <div className="flex items-center">
    <div className={cn(
      "w-5 h-5 border flex items-center justify-center transition-all duration-200",
      useInsurance 
        ? "bg-black border-black" 
        : "bg-white border-zinc-300"
    )}>
      {useInsurance && (
        <svg 
          className="w-3.5 h-3.5 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={4}
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <input 
      type="checkbox" 
      className="hidden" 
      checked={useInsurance} 
      onChange={() => {}} // Di handle oleh parent div onClick
    />
  </div>
</div>
      </div>
    </div>
  );
}