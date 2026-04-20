"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  waybill: string;
  invoice: string;
}

export default function TrackingModal({ isOpen, onClose, waybill, invoice }: TrackingModalProps) {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && waybill && waybill !== "WAITING") {
      fetchTracking();
    } else if (isOpen && (waybill === "WAITING" || !waybill)) {
      setTrackingData(null);
    }
  }, [isOpen, waybill]);

const fetchTracking = async () => {
  setLoading(true);
  try {
    // Tarik data dari database internal kita sendiri
    const res = await fetch(`/api/shipping/history/${invoice}`);
    const data = await res.json();
    
    if (res.ok) {
      setTrackingData(data); 
    } else {
      setTrackingData(null);
      console.error(data.error);
    }
  } catch (err) {
    console.error("Gagal menarik data dari OrderHistory:", err);
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-none shadow-sm overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-white">
          <div className="space-y-1">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-normal">Tracking Detail</h2>
            <p className="text-xs text-gray-800 font-normal">{invoice}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Info Area */}
        <div className="p-6 bg-gray-50/50 flex justify-between items-center border-b border-gray-100">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Logistik</p>
            <p className="text-xs text-gray-700 font-normal tracking-wide uppercase">Lion Parcel</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">No. Resi (STT)</p>
            <p className="text-xs text-[#FF5722] font-normal tracking-[0.1em]">{waybill || "TIDAK TERSEDIA"}</p>
          </div>
        </div>

        {/* Content / Timeline */}
        <div className="flex-1 p-8 overflow-y-auto no-scrollbar min-h-[350px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="animate-spin text-gray-200" size={20} strokeWidth={1.5} />
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300">Menghubungkan ke Lion Parcel</p>
            </div>
          ) : (waybill === "WAITING" || !waybill || !trackingData?.history) ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Belum ada riwayat pengiriman</p>
              <p className="text-[9px] text-gray-300 uppercase">Resi sedang diproses oleh pihak logistik</p>
            </div>
          ) : (
            <div className="relative space-y-10">
              {trackingData.history.map((step: any, idx: number) => (
                <div key={idx} className="relative flex gap-8">
                  {/* Line Vertikal */}
                  {idx !== trackingData.history.length - 1 && (
                    <div className="absolute left-[9px] top-6 w-[1px] h-[calc(100%+24px)] bg-gray-100" />
                  )}
                  
                  {/* Marker - Norvine Sharp Style */}
                  <div className={`relative z-10 w-[19px] h-[19px] flex items-center justify-center border bg-white ${idx === 0 ? 'border-[#FF5722]' : 'border-gray-200'}`}>
                    <div className={`w-[5px] h-[5px] ${idx === 0 ? 'bg-[#FF5722]' : 'bg-gray-200'}`} />
                  </div>

                  <div className="flex-1 -mt-1">
                    <p className={`text-[11px] font-normal uppercase tracking-widest ${idx === 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.status_description || step.status}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1 mb-3 tracking-wider font-normal">
                      {step.date} {step.time}
                    </p>
                    <p className="text-[11px] text-gray-500 font-normal leading-relaxed">
                      {step.location || "Lokasi tidak terdaftar"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-900 text-white text-[10px] uppercase tracking-[0.4em] font-normal rounded-none hover:bg-black transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}