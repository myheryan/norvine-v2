import { useState } from 'react'
import { FiChevronRight, FiChevronUp, FiChevronDown, FiInfo, FiCheckCircle } from 'react-icons/fi'
import { formatRp } from '@/lib/utils'
import { FiTagIcon } from '../icons';

interface SummaryProps {
  options: { shipping: string; payment: string };
  setOptions: React.Dispatch<React.SetStateAction<{ shipping: string; payment: string }>>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  insuranceCost: number;
  serviceFee: number;
  total: number; // Nilai total dari parent
  isSubmitting: boolean;
  isCheckoutDisabled: boolean; // Tambahkan di interface
  setOrderData: React.Dispatch<React.SetStateAction<any>>;
  setIsModalOpen: (open: boolean) => void;
  appliedPromo?: { code: string | null; name?: string };
}

export default function OrderSummary({ 
  options, 
  setOptions, 
  subtotal, 
  discount, 
  shippingCost, 
  insuranceCost,
  serviceFee,
  total, // Gunakan total yang dihitung di parent agar sinkron
  isSubmitting,
  isCheckoutDisabled,
  setIsModalOpen,
  appliedPromo
}: SummaryProps) {
  const [showDetails, setShowDetails] = useState(true);  


  if (!options.shipping || shippingCost === 0) {
    return (
      <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white border-2 border-dashed border-zinc-200 p-8 flex flex-col items-center text-center">
          {/* Icon Shield/Lock Minimalis */}
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 mb-2">
            Ekspedisi tidak tersedia
          </h3>
          
        </div>
        
        {/* Info Tambahan Bawah */}
        <p className="mt-4 text-[9px] text-zinc-400 text-center uppercase tracking-widest leading-loose">
          Secure Checkout System <br /> Norvine Privilege Service
        </p>
      </div> )
  }


  // Daftar Metode Pembayaran
  const paymentMethods = [
    { id: 'bca_va', label: 'BCA Virtual Account', icon: 'BCA' },
    // { id: 'mandiri_va', label: 'Mandiri Virtual Account', icon: 'MANDIRI' },
    { id: 'qris', label: 'QRIS / E-Wallet', icon: 'QRIS' },
  ];

  return (
    <div className="w-full lg:w-[400px] shrink-0 space-y-3 lg:sticky lg:top-8 lg:mb-0">
      
      {/* SECTION 1: METODE PEMBAYARAN */}
      <div className="bg-white p-6 border border-zinc-100 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 mb-5">Metode Pembayaran</h3>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <label key={method.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-7 bg-zinc-50 border border-zinc-100 rounded-none flex items-center justify-center text-[9px]  text-zinc-800 italic">
                  {method.icon}
                </div>
                <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">
                  {method.label}
                </span>
              </div>
              <input 
                type="radio" 
                name="payment_method" 
                value={method.id}
                checked={options.payment === method.id} 
                onChange={() => setOptions({ ...options, payment: method.id })}
                className="w-4 h-4 accent-emerald-600"
                required
              />
            </label>
          ))}
        </div>
      </div>


      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
        
        <div className="p-4 bg-zinc-50/50 border-b border-zinc-100">
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center justify-between p-3 border transition-all ${discount > 0 ? 'border-emerald-500 bg-white' : 'border-zinc-200 bg-white hover:border-zinc-900'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center ${discount > 0 ? 'text-emerald-600' : 'text-zinc-600'}`}>
                 <FiTagIcon size={20}/>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[11px] text-zinc-800 leading-none mb-1">
                  {discount > 0 ? 'Promo Terpasang' : 'Gunakan Promo'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold tracking-tighter">
                  {discount > 0 ? (appliedPromo?.code || 'Diskon Berhasil') : 'Klik untuk lihat voucher'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
               {discount > 0 && <span className="text-xs font-bold text-emerald-600">-{formatRp(discount)}</span>}
               <FiChevronRight className="text-zinc-300" size={18} />
            </div>
          </button>
        </div>

        {/* RINGKASAN PEMBAYARAN */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">Ringkasan Transaksi</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Total Harga Produk</span>
              <span className="text-zinc-900">{formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Ongkos Kirim</span>
              <span className="text-zinc-900">{formatRp(shippingCost)}</span>
            </div>

            <div className="pt-1">
              <button 
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 transition-colors text-[11px]"
              >
                <span>Rincian Biaya</span>
                {showDetails ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {showDetails && (
                <div className="mt-3 space-y-3 border-l border-zinc-100 pl-4 ml-1">
                  {insuranceCost > 0 && (
                    <div className="flex justify-between text-zinc-500">
                      <span>Asuransi Kurir</span>
                      <span>{formatRp(insuranceCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>Biaya Layanan</span>
                    <span>{formatRp(serviceFee)}</span>
                  </div>
                  {/* <div className="flex justify-between text-zinc-500">
                    <span>Pajak (PPN 11%)</span>
                    <span>{formatRp(taxAmount)}</span>
                  </div> */}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Potongan Promo</span>
                      <span>-{formatRp(discount)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* TOTAL FINAL */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-zinc-600">Total Tagihan</span>
              <span className="text-xl font-semibold text-zinc-900 ">
                {formatRp(total)}
              </span>
            </div>
            
            <button 
              type="submit"
             disabled={isCheckoutDisabled || !options.payment}
              className="w-full bg-zinc-900 rounded-full text-white py-4 font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20 hover:bg-emerald-600"
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2">
                   <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin"></div>
                   Processing
                 </span>
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

