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
  appliedPromo: { code: string | null; name: string; id?: any }; // Update Type
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

      setOrderData((prev: any) => ({
        ...prev,
        appliedPromo: { 
          id: result.promo.id, 
          code: result.promo.code, 
          name: result.promo.name 
        },
        discount: result.promo.discountAmount 
      }));
      
      setPromoInput('');
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
    // Kembalikan ke objek default, bukan null
    setOrderData((prev: any) => ({ 
      ...prev, 
      appliedPromo: { code: null, name: '' }, 
      discount: 0 
    }))
    setPromoInput('')
    toast.info("Voucher dilepaskan")
  }

  if (!isOpen) return null

  // Helper untuk cek apakah ada promo yang aktif
  const hasActivePromo = !!appliedPromo.code;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-[80vh] md:h-auto md:max-h-[650px] rounded-none flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-tighter">Voucher & Promo</h3>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">Pilih promo untuk pesananmu</p>
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
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Punya kode promo?</label>
            <div className={`flex bg-white border transition-all ${hasActivePromo ? 'border-zinc-900' : 'border-zinc-200 focus-within:border-zinc-400'}`}>
              <input 
                type="text" 
                value={hasActivePromo ? appliedPromo.code : promoInput}
                disabled={hasActivePromo || isApplying}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE" 
                className="flex-1 px-4 py-3 bg-transparent outline-none text-sm placeholder:text-zinc-300 disabled:text-zinc-900 font-bold tracking-widest"
              />
              {hasActivePromo ? (
                <button 
                  type="button"
                  onClick={handleRemovePromo} 
                  className="px-6 py-3 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
                >
                  Lepas
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleCheckPromo(promoInput)}
                  disabled={!promoInput || isApplying}
                  className="px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest disabled:bg-zinc-100 disabled:text-zinc-400 transition-all active:scale-95"
                >
                  {isApplying ? '...' : 'Pakai'}
                </button>
              )}
            </div>
          </section>

          {/* Daftar Voucher */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Promo Tersedia</h4>
            
            {isFetchingList ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <FiLoader className="animate-spin text-zinc-900" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Memuat...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {availablePromos.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-zinc-200 bg-white">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Belum ada promo tersedia</p>
                    </div>
                ) : availablePromos.map((promo) => {
                  const isSelected = appliedPromo.code === promo.code;
                  const isLocked = hasActivePromo && !isSelected;

                  return (
                    <div 
                      key={promo.id} 
                      onClick={() => {
                        if (isLocked || isApplying) return;
                        isSelected ? handleRemovePromo() : handleCheckPromo(promo.code);
                      }}
                      className={`relative flex h-24 border transition-all rounded-none ${
                        isSelected 
                          ? 'border-zinc-900 bg-white shadow-lg z-10 scale-[1.02]' 
                          : 'border-zinc-200 bg-white hover:border-zinc-400'
                      } ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-20 flex flex-col items-center justify-center border-r border-dashed border-zinc-200 ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-300'}`}>
                        <FiTag size={20} />
                        <span className="text-[8px] font-black mt-1 tracking-tighter">NORVINE</span>
                      </div>

                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-black uppercase tracking-tighter text-zinc-900">
                              {promo.type === 'PERCENT' ? `${promo.value}% OFF` : `POTONGAN ${formatRp(promo.value)}`}
                            </h5>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                              MIN. BELANJA {formatRp(promo.minOrder)}
                            </p>
                          </div>
                          {isSelected && <FiCheckCircle className="text-zinc-900" size={18} />}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold bg-zinc-100 px-2 py-0.5 text-zinc-600 tracking-widest">
                            {promo.code}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-red-600' : 'text-zinc-900'}`}>
                            {applyingCode === promo.code ? '...' : isSelected ? 'LEPAS' : 'GUNAKAN'}
                          </span>
                        </div>
                      </div>

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
            <FiAlertCircle className="text-zinc-400 shrink-0 mt-0.5" size={14} />
            <p className="text-[9px] font-bold text-zinc-400 uppercase leading-loose tracking-widest">
              Voucher hanya berlaku untuk satu kali transaksi. Syarat dan ketentuan berlaku sesuai kebijakan Norvine Terminal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}