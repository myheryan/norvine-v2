import { FiTruck, FiShield, FiLoader, FiCheck } from 'react-icons/fi'
import { formatRp } from '@/lib/utils'
import { ShippingData } from '@/types/checkout'

interface ShippingSectionProps {
  shippingData: ShippingData;
  isCheckingShipping: boolean;
  selectedService: string;
  useInsurance: boolean;
  onServiceChange: (code: string) => void;
  onInsuranceToggle: () => void;
}

export default function ShippingSection({
  shippingData,
  isCheckingShipping,
  selectedService,
  useInsurance,
  onServiceChange,
  onInsuranceToggle
}: ShippingSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Pengiriman & Proteksi</h3>
      
      {/* 1. SELEKSI KURIR */}
      <div className="bg-white border border-zinc-100 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FiTruck className="text-zinc-600" size={16} />
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Pilih Layanan Lion Parcel</span>
        </div>

        {isCheckingShipping ? (
          <div className="flex items-center gap-3 py-4 text-zinc-600">
            <FiLoader className="animate-spin" size={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Memperbarui Ongkir...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {shippingData.services.map((service) => (
              <div 
                key={service.service_code}
                onClick={() => onServiceChange(service.service_code)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-all border ${
                  selectedService === service.service_code 
                  ? 'border-emerald-600 bg-emerald-50/20' 
                  : 'border-zinc-50 hover:border-zinc-200 bg-zinc-50/30'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">{service.service_name}</span>
                  <span className="text-[10px] text-zinc-600 font-medium">Estimasi {service.estimasi} Hari</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-zinc-900">{formatRp(service.price)}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedService === service.service_code ? 'bg-emerald-600 border-emerald-600' : 'border-zinc-300'}`}>
                    {selectedService === service.service_code && <FiCheck className="text-white" size={10} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. ASURANSI (LOGISTIK) */}
      <div 
        onClick={onInsuranceToggle}
        className={`p-5 border transition-all cursor-pointer flex items-center justify-between ${
          useInsurance ? 'border-emerald-600 bg-emerald-50/30' : 'border-zinc-100 bg-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`${useInsurance ? 'text-emerald-600' : 'text-zinc-300'}`}>
            <FiShield size={22} />
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Asuransi Pengiriman</h4>
            <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Proteksi penuh barang pecah belah & hilang</p>
          </div>
        </div>
        <div className={`w-5 h-5 border flex items-center justify-center transition-all ${
          useInsurance ? 'bg-emerald-600 border-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.2)]' : 'border-zinc-200'
        }`}>
          {useInsurance && <div className="w-1.5 h-1.5 bg-white" />}
        </div>
      </div>
    </div>
  )
}