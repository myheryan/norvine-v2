"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  waybill: string;
  invoice: string;
}

export default function TrackingModal({ isOpen, onClose, waybill, invoice }: TrackingModalProps) {
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      fetchInternalHistory();
    }
  }, [isOpen, invoice]);

  const fetchInternalHistory = async () => {
    setLoading(true);
    try {
      // Mengambil data dari endpoint history internal
      const res = await fetch(`/api/shipping/history/${invoice}`);
      const data = await res.json();
      
      if (res.ok) {
        // Jika API mengembalikan object transaction, ambil field history-nya
        setTrackingData(data.history || []); 
      } else {
        setTrackingData([]);
      }
    } catch (err) {
      console.error("Gagal menarik data dari OrderHistory:", err);
      setTrackingData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-none shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-50 bg-white">
          <div className="space-y-1">
            <h2 className="text-[10px]  text-gray-400 font-normal">Internal Tracking</h2>
            <p className="text-xs text-gray-800 font-normalp-3">{invoice}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors outline-none">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Info Area - Minimalist */}
        <div className="p-3 bg-gray-50/50 flex justify-between items-center border-b border-gray-100">
          <div>
            <p className="text-[9px]  text-gray-400 mb-1">Status Terakhir</p>
            <p className="text-xs text-gray-700 font-normal tracking-wide ">
              {trackingData[0]?.status || "Pending"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400 mb-1">No. Resi</p>
            <p className="text-xs text-[#FF5722] font-normal tracking-[0.1em]">{waybill || "BELUM TERSEDIA"}</p>
          </div>
        </div>

        {/* Content / Timeline */}
        <div className="flex-1 p-8 overflow-y-auto no-scrollbar min-h-[300px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="animate-spin text-gray-200" size={20} strokeWidth={1.5} />
              <p className="text-[10px]  tracking-[0.3em] text-gray-300">Sinkronisasi Database</p>
            </div>
          ) : trackingData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="text-[10px]  tracking-[0.2em] text-gray-400">Belum ada riwayat status</p>
            </div>
          ) : (
           <div className="space-y-2">
               <div className="relative space-y-2 before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                  {trackingData?.map((hist: any, index: number) => (
                    <div key={hist.id} className={`relative pl-2`}>
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full flex items-center justify-center z-10 ${index === 0 ? 'bg-[#26aa99] shadow-md' : 'bg-gray-200'}`}>
                        {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                      </div>
                      <div className="flex flex-col md:flex-row-reverse justify-end md:gap-5 pl-3">
                        <p className="text-[11px] text-gray-700 mt-0.5 leading-snug">{hist.notes || `Status pesanan berubah menjadi ${hist.status}`}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{new Date(hist.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-50">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-900 text-white text-[10px]  font-normal rounded-none hover:bg-black transition-colors outline-none"
          >
            Tutup rincian
          </button>
        </div>
      </div>
    </div>
  );
}