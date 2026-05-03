"use client";

import { useState, useEffect } from "react";
import { 
  X, Loader2, Copy, MapPin, Phone, 
  ChevronRight, Star, Package, Truck, User, Check 
} from "lucide-react";
import { toast } from "sonner";
import { cn, toSentenceCase } from "@/lib/utils";

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
    if (isOpen && (invoice || waybill)) {
      fetchTrackingData();
    }
  }, [isOpen, invoice, waybill]);

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipping/track-combined?invoice=${invoice}&waybill=${waybill}`);
      const data = await res.json();
      
      if (res.ok) {
        setTrackingData(data); 
      } else {
        setTrackingData(null);
      }
    } catch (err) {
      console.error("Gagal menarik data pelacakan:", err);
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const copyWaybill = () => {
    const textToCopy = waybill || trackingData?.waybill;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast.success("Nomor resi disalin");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 transition-all">
      <div className="bg-zinc-50 w-full max-w-lg rounded-none shadow-2xl flex flex-col h-full md:h-[90vh] overflow-hidden">
        
        {/* 1. Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-zinc-100 sticky top-0 z-20">
          <button onClick={onClose} className="text-zinc-900 outline-none hover:opacity-70 transition-opacity">
            <X size={24} strokeWidth={2} />
          </button>
          <h2 className="text-[16px] font-bold text-zinc-900">Lacak paket</h2>
          <div className="w-6" /> 
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 space-y-3">
          
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-40">
              <Loader2 className="animate-spin text-zinc-300" size={32} strokeWidth={1.5} />
              <p className="text-[11px] tracking-[0.2em] text-zinc-400 uppercase font-bold">Sinkronisasi Logistik</p>
            </div>
          ) : !trackingData ? (
            <div className="py-20 text-center">
              <Package size={48} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-[12px] text-zinc-400">Belum ada riwayat pelacakan</p>
            </div>
          ) : (
            <>
              {/* 2. Map View Placeholder */}
              <div className="h-[250px] w-full bg-zinc-200 relative overflow-hidden shrink-0">
                <img 
                  src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/106.8271,-6.1751,12,0/600x400?access_token=YOUR_MAPBOX_TOKEN" 
                  className="w-full h-full object-cover grayscale opacity-80"
                  alt="Map Location"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="bg-white px-3 py-1.5 border border-zinc-200 shadow-xl mb-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-900 uppercase">
                        {trackingData.current_location || "Transit"}
                      </span>
                   </div>
                   <div className="w-5 h-5 bg-zinc-950 rounded-full border-4 border-white shadow-md mx-auto animate-pulse" />
                </div>
              </div>

              {/* 3. Status Summary */}
              <div className="bg-white p-5 border-b border-zinc-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight mb-1 uppercase">
                      {trackingData.current_status || "Processing"}
                    </h1>
                    <p className="text-[12px] text-zinc-400 font-medium">
                       Penerima: <span className="text-zinc-900 font-bold">{trackingData.recipient_name || "-"}</span>
                    </p>
                  </div>
                  {trackingData.current_status === 'POD' && (
                    <div className="bg-emerald-50 text-emerald-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      Diterima
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Logistics Provider Info */}
              <div className="bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-zinc-100 flex items-center justify-center p-1 bg-zinc-50">
                     <Truck size={20} className="text-zinc-900" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-black">{trackingData.courierCode}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">{trackingData.product_type || "Standard Service"}</p>
                    <div className="flex items-center gap-1.5 pt-0.5 cursor-pointer group" onClick={copyWaybill}>
                      <span className="text-[12px] text-zinc-400 font-bold group-hover:text-zinc-900 transition-colors">
                        {waybill || trackingData.waybill}
                      </span>
                      <Copy size={12} className="text-zinc-300 group-hover:text-zinc-900" />
                    </div>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-zinc-400 flex items-center gap-1 hover:text-zinc-900 transition-colors">
                  Hubungi <ChevronRight size={14} />
                </button>
              </div>

              {/* 5. Courier Info */}
              <div className="bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                      <User size={20} />
                   </div>
                   <div>
                     <p className="text-[13px] font-bold tracking-tight">{trackingData.courier_name || "Admin Norvine"}</p>
                     <p className="text-[11px] text-zinc-500 font-medium">Courier</p>
                   </div>
                </div>
                <div className="w-10 h-10 border border-zinc-100 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-colors cursor-pointer">
                  <Phone size={18} className="text-zinc-900" />
                </div>
              </div>

              {/* 6. Timeline Riwayat */}
              <div className="bg-white p-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-6 border-b border-zinc-50 pb-2">
                  Riwayat perjalanan
                </p>
                 {trackingData.history?.map((hist: any, index: number) => (
                   <div key={hist.id || index} className="flex gap-4">
                     {/* Waktu Kiri */}
                     <div className="w-16 text-right shrink-0">
                        <p className="text-[11px] font-bold text-zinc-900">
                          {new Date(hist.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                          {new Date(hist.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>

                     {/* Dot & Garis Tengah */}
                     <div className="flex flex-col items-center relative">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm transition-all duration-500",
                          index === 0 ? "bg-zinc-950 scale-110" : "bg-zinc-200"
                        )}>
                          {index === 0 && <Check size={10} className="text-white" strokeWidth={4} />}
                        </div>
                        {index !== trackingData.history.length - 1 && (
                          <div className="w-[1px] bg-zinc-100 h-full absolute top-5" />
                        )}
                     </div>

                     {/* Konten Kanan */}
                     <div className="flex-1">
                        <p className={cn(
                          "text-[13px] leading-relaxed",
                          index === 0 ? "font-bold text-zinc-950" : "font-medium text-zinc-500"
                        )}>
                          {toSentenceCase(hist.notes || hist.remarks)}
                        </p>
                        
                        {hist.location && (
                          <p className="text-[11px] text-zinc-400 mt-1 font-medium flex items-center gap-1">
                            <MapPin size={10} /> {hist.location}
                          </p>
                        )}
                        
                        {/* Foto POD (Dinamis dari URL Lion Parcel) */}
                        {hist.attachment && hist.attachment.length > 0 && (
                          <div className="mt-4 border border-zinc-100 p-1 bg-white shadow-sm max-w-[240px] group cursor-zoom-in">
                             <div className="relative overflow-hidden">
                                <img 
                                  src={hist.attachment[0]} 
                                  className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                  alt="Bukti Penerimaan" 
                                  onClick={() => window.open(hist.attachment[0], '_blank')}
                                />
                             </div>
                             <div className="p-2 bg-zinc-50">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Foto bukti penerimaan</p>
                             </div>
                          </div>
                        )}
                     </div>
                   </div>
                 ))}
              </div>
            </>
          )}
        </div>

        {/* 7. Footer */}
        <div className="p-4 bg-white border-t border-zinc-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-none hover:bg-black transition-all active:scale-[0.98]"
          >
            Tutup rincian
          </button>
        </div>
      </div>
    </div>
  );
}