"use client"

import { useState, useEffect } from 'react'
import { FiX, FiCheckCircle, FiLoader, FiAlertCircle, FiTag } from 'react-icons/fi'
import { toast } from 'sonner'
import { formatRp } from '@/lib/utils'

interface PromoModalProps {
  isOpen: boolean;
  subtotal: number;
  onClose: () => void;
  items: any[];
  appliedPromo: any;
  setOrderData: (data: any) => void;
}

export default function PromoModal({ isOpen, subtotal, onClose, items, appliedPromo, setOrderData }: PromoModalProps) {
  const [promoInput, setPromoInput] = useState('')
  const [availablePromos, setAvailablePromos] = useState<any[]>([])
  const [isFetchingList, setIsFetchingList] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyingCode, setApplyingCode] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) fetchListPromos()
  }, [isOpen])

  const fetchListPromos = async () => {
    setIsFetchingList(true)
    try {
      const res = await fetch('/api/promo')
      const result = await res.json()
      if (result.success) setAvailablePromos(result.data)
    } catch (err) {
      console.error("Gagal memuat promo")
    } finally { setIsFetchingList(false) }
  }

const handleCheckPromo = async (codeToUse: string) => {
  const code = codeToUse.trim().toUpperCase();
  if (!code) return toast.error("Masukkan kode promo");
  
  setApplyingCode(code);
  setIsApplying(true);

  try {
    const cartSummary = items.map(i => ({ 
      productId: i.productId || i.id, 
      quantity: i.quantity 
    }));
    
    const res = await fetch(`/api/promo?code=${code}&cartItems=${encodeURIComponent(JSON.stringify(cartSummary))}`);
    const result = await res.json();

    if (!res.ok || !result.success) throw new Error(result.message || "Voucher tidak memenuhi syarat");

    // UPDATE STATE: Pastikan discountAmount dari server masuk ke state utama
    setOrderData((prev: any) => ({
      ...prev,
      appliedPromo: { 
        id: result.promo.id, 
        code: result.promo.code, 
        name: result.promo.name 
      },
      discount: result.promo.discountAmount // Ini yang memotong harga di Checkout
    }));
    
    setPromoInput(''); // Bersihkan input manual
    toast.success("Voucher berhasil terpasang!");
    onClose();
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setIsApplying(false);
    setApplyingCode(null);
  }
}

  const handleRemovePromo = () => {
    setOrderData((prev: any) => ({ ...prev, appliedPromo: null, discount: 0 }))
    setPromoInput('')
    toast.info("Voucher dilepaskan")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div 
        className="bg-white w-full max-w-md h-[80vh] md:h-auto md:max-h-[650px] rounded-none flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Voucher & Promo</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Pilih promo untuk pesananmu</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <FiX size={24} className="text-zinc-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-6 space-y-8 scrollbar-hide">
          
          {/* Input Manual */}
          <section className="space-y-3">
            <label className="text-sm font-semibold text-zinc-700">Punya kode promo?</label>
            <div className={`flex bg-white border transition-all ${appliedPromo?.code ? 'border-zinc-900' : 'border-zinc-200 focus-within:border-zinc-400'}`}>
              <input 
                type="text" 
                value={appliedPromo?.code || promoInput}
                disabled={!!appliedPromo?.code || isApplying}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Masukkan Kode Promo" 
                className="flex-1 px-4 py-3 bg-transparent outline-none text-sm placeholder:text-zinc-400 disabled:text-zinc-900 font-medium"
              />
              {appliedPromo?.code ? (
                <button 
                  type="button"
                  onClick={handleRemovePromo} 
                  className="px-6 py-3 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Lepas
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleCheckPromo(promoInput)}
                  disabled={!promoInput || isApplying}
                  className="px-6 py-3 bg-zinc-900 text-white text-sm font-bold disabled:bg-zinc-200 transition-all active:scale-95"
                >
                  {isApplying ? '...' : 'Pakai'}
                </button>
              )}
            </div>
          </section>

          {/* Daftar Voucher */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-700">Promo Tersedia</h4>
            
            {isFetchingList ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <FiLoader className="animate-spin text-zinc-900" size={24} />
                <span className="text-sm text-zinc-500">Memuat promo...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {availablePromos.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-zinc-200 bg-white">
                        <p className="text-sm text-zinc-400">Belum ada promo tersedia saat ini</p>
                    </div>
                ) : availablePromos.map((promo) => {
                  const isSelected = !!appliedPromo && appliedPromo.code === promo.code;
                  const isLocked = !!appliedPromo && !isSelected;

                  return (
                    <div 
                      key={promo.id} 
                      onClick={() => {
                        if (isLocked || isApplying) return;
                        isSelected ? handleRemovePromo() : handleCheckPromo(promo.code);
                      }}
                      className={`relative flex h-24 border transition-all rounded-none ${
                        isSelected 
                          ? 'border-zinc-900 bg-white shadow-md z-10' 
                          : 'border-zinc-200 bg-white hover:border-zinc-400'
                      } ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Ticket Left */}
                      <div className={`w-20 flex flex-col items-center justify-center border-r border-dashed border-zinc-200 ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                        <FiTag size={20} />
                        <span className="text-[10px] font-bold mt-1">PROMO</span>
                      </div>

                      {/* Ticket Right */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-bold text-zinc-900">
                              {promo.type === 'PERCENT' ? `${promo.value}% Potongan` : `${formatRp(promo.value)} Potongan`}
                            </h5>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Min. Belanja {formatRp(promo.minOrder)}
                            </p>
                          </div>
                          {isSelected && <FiCheckCircle className="text-zinc-900" size={18} />}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold bg-zinc-100 px-2 py-0.5 text-zinc-600">
                            {promo.code}
                          </span>
                          <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-red-600' : 'text-zinc-900'}`}>
                            {applyingCode === promo.code ? 'Memproses...' : isSelected ? 'Lepas Promo' : 'Gunakan'}
                          </span>
                        </div>
                      </div>

                      {/* Notch Circles */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-5 h-5 bg-zinc-50 md:bg-white rounded-full border border-zinc-200 z-20" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-5 h-5 bg-zinc-50 md:bg-white rounded-full border border-zinc-200 z-20" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-100">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-zinc-400 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-zinc-500 leading-normal">
              Voucher hanya berlaku untuk satu kali transaksi. Syarat dan ketentuan berlaku sesuai dengan kebijakan promo Norvine.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}