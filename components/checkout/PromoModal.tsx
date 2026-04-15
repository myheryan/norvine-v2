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
  appliedPromo: any; // Sebaiknya null jika tidak ada promo
  setOrderData: (data: any) => void;
}

export default function PromoModal({ isOpen, subtotal, onClose, items, appliedPromo, setOrderData }: PromoModalProps) {
  const [promoInput, setPromoInput] = useState('')
  const [availablePromos, setAvailablePromos] = useState<any[]>([])
  const [isFetchingList, setIsFetchingList] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyingCode, setApplyingCode] = useState<string | null>(null)

  // Ambil list promo saat modal dibuka
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
    const code = codeToUse.trim().toUpperCase()
    if (!code) return toast.error("Masukkan kode promo")
    
    setApplyingCode(code)
    setIsApplying(true)

    try {
      // Mapping items untuk validasi server
      const cartSummary = items.map(i => ({ 
        productId: i.productId || i.id, 
        quantity: i.quantity 
      }))
      
      const res = await fetch(`/api/promo?code=${code}&cartItems=${encodeURIComponent(JSON.stringify(cartSummary))}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Voucher tidak memenuhi syarat")
      }

      // Update State Utama di CheckoutPage
      setOrderData((prev: any) => ({
        ...prev,
        appliedPromo: { 
          id: result.promo.id, 
          code: result.promo.code, 
          name: result.promo.name 
        },
        discount: result.promo.discountAmount
      }))
      
      toast.success("Voucher berhasil terpasang!")
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsApplying(false)
      setApplyingCode(null)
    }
  }

  const handleRemovePromo = () => {
    setOrderData((prev: any) => ({ 
      ...prev, 
      appliedPromo: null, 
      discount: 0 
    }))
    setPromoInput('')
    toast.info("Voucher dilepaskan")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center bg-zinc-950/60 backdrop-blur-sm pointer-events-auto">
      <div 
        className="bg-white w-full max-w-md h-[80vh] md:rounded-sm flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 pointer-events-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between bg-white shrink-0 relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Voucher Norvine</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-zinc-50 rounded-full transition-all cursor-pointer"
          >
            <FiX size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 space-y-8 scrollbar-hide">
          
          {/* Input Manual */}
          <section className="space-y-3">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Punya kode promo?</p>
            <div className={`p-1.5 rounded-sm border flex bg-white relative z-20 ${appliedPromo?.code ? 'border-zinc-900' : 'border-zinc-200'}`}>
              <input 
                type="text" 
                value={appliedPromo?.code || promoInput}
                disabled={!!appliedPromo?.code || isApplying}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="INPUT KODE" 
                className="flex-1 px-4 py-2 bg-transparent outline-none text-xs font-bold tracking-widest uppercase disabled:text-zinc-900"
              />
              {appliedPromo?.code ? (
                <button 
                  type="button"
                  onClick={handleRemovePromo} 
                  className="px-4 py-2 text-red-500 text-[9px] font-black uppercase cursor-pointer"
                >
                  Lepas
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleCheckPromo(promoInput)}
                  disabled={!promoInput || isApplying}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-sm text-[9px] font-black uppercase cursor-pointer disabled:bg-zinc-200"
                >
                  {isApplying ? '...' : 'Pakai'}
                </button>
              )}
            </div>
          </section>

          {/* Daftar Voucher */}
          <section className="space-y-4">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tersedia Untukmu</p>
            
            {isFetchingList ? (
              <div className="py-10 flex justify-center"><FiLoader className="animate-spin text-zinc-900" /></div>
            ) : (
              <div className="space-y-3">
                {availablePromos.map((promo) => {
                  // Perbaikan logika isSelected: Cek keberadaan appliedPromo dulu
                  const isSelected = !!appliedPromo && appliedPromo.code === promo.code;
                  const isLocked = !!appliedPromo && !isSelected;

                  return (
                    <div 
                      key={promo.id} 
                      onClick={() => {
                        if (isLocked || isApplying) return;
                        isSelected ? handleRemovePromo() : handleCheckPromo(promo.code);
                      }}
                      className={`group relative bg-white border rounded-sm transition-all overflow-hidden flex h-24 pointer-events-auto ${
                        isSelected ? 'border-zinc-900 shadow-md scale-[1.01]' : 'border-zinc-100 hover:border-zinc-300'
                      } ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Ticket Side */}
                      <div className={`w-20 flex flex-col items-center justify-center border-r border-dashed ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                        <FiTag size={18} />
                        <span className="text-[8px] font-black uppercase mt-1">Promo</span>
                      </div>

                      {/* Content Side */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-zinc-900 uppercase">
                              {promo.type === 'PERCENT' ? `${promo.value}% OFF` : `${formatRp(promo.value)} OFF`}
                            </h4>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Min. Belanja {formatRp(promo.minOrder)}</p>
                          </div>
                          {isSelected && <FiCheckCircle className="text-zinc-900" size={16} />}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black bg-zinc-100 px-2 py-0.5 text-zinc-500 uppercase tracking-tighter">{promo.code}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-red-500' : 'text-orange-600'}`}>
                            {applyingCode === promo.code ? '...' : isSelected ? 'Lepas' : 'Gunakan'}
                          </span>
                        </div>
                      </div>

                      {/* Decorative Circles */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-5 h-5 bg-zinc-50 rounded-full border border-zinc-200" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-5 h-5 bg-zinc-50 rounded-full border border-zinc-200" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
          <div className="flex items-start gap-3 opacity-60">
            <FiAlertCircle className="text-zinc-400 shrink-0 mt-0.5" size={14} />
            <p className="text-[8px] font-bold text-zinc-500 leading-normal uppercase tracking-widest">
              Promo tidak dapat digabungkan dengan voucher lainnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}