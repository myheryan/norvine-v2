"use client"

import { toSentenceCase } from '@/lib/utils';
import React, { useState } from 'react'
import { FiImage, FiX, FiMaximize2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface TrackingHistory {
  id: string;
  notes: string;
  createdAt: string | Date;
  location?: string;
  attachment?: string[];
}

interface OrderTrackingProps {
  history: TrackingHistory[];
  awbNumber?: string;
  isLoading?: boolean;
}

export default function OrderTracking({ history, awbNumber, isLoading }: OrderTrackingProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // State untuk mengontrol apakah sisa riwayat ditampilkan
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <div className="text-[11px] animate-pulse text-gray-400">Mengambil data pelacakan...</div>;
  }

  // Pisahkan data: 3 teratas dan sisanya
  const visibleHistory = isExpanded ? history : history?.slice(0, 3);
  const hasMore = history?.length > 3;

  return (
    <div className="md:col-span-7 md:border-l border-gray-100 md:pl-8">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[12px] font-semibold text-gray-600 tracking-wide">
          Status Pesanan
        </p>
        {awbNumber && (
          <span className="text-[12px] bg-gray-100 px-2 py-0.5 rounded text-zinc-600 tracking-wide">
            {awbNumber}
          </span>
        )}
      </div>

      <div className="relative space-y-4 before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
        {visibleHistory?.length > 0 ? (
          <>
            {visibleHistory.map((hist, index) => (
              <div key={hist.id} className="relative pl-6">
                <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full flex items-center justify-center z-10 ${
                  index === 0 ? 'bg-[#26aa99] shadow-md' : 'bg-gray-200'
                }`}>
                  {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                </div>

                <div className="flex flex-col">
                  <p className={`text-[12px] leading-snug ${index === 0 ? 'text-black font-bold' : 'text-gray-700'}`}>
                    {toSentenceCase(hist.notes)}
                  </p>
                  
                  <div className="flex gap-2 items-center mt-1">
                    <p className="text-[10px] text-gray-400">
                      {new Date(hist.createdAt).toLocaleString('id-ID', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </p>
                    {hist.location && (
                      <span className="text-[10px] text-[#26aa99] font-medium uppercase">
                        • {hist.location}
                      </span>
                    )}
                  </div>

                  {hist.attachment && hist.attachment.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hist.attachment.map((imgUrl, i) => (
                        <button 
                          key={i} 
                          onClick={() => setPreviewImage(imgUrl)}
                          className="relative group w-16 h-16 rounded-sm overflow-hidden border border-gray-100 bg-gray-50"
                        >
                          <img src={imgUrl} alt="POD" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FiMaximize2 className="text-white text-[10px]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Tombol Dropdown / Expand */}
            {hasMore && (
              <div className="pl-6 pt-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#26aa99] hover:text-[#1e8578] transition-colors uppercase tracking-tight"
                >
                  {isExpanded ? (
                    <><FiChevronUp size={14} /> Sembunyikan Riwayat</>
                  ) : (
                    <><FiChevronDown size={14} /> Lihat {history.length - 3} Status Lainnya</>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-[11px] text-gray-400 italic pl-6">Belum ada riwayat pengiriman.</p>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center">
            <button className="absolute -top-10 right-0 text-white flex items-center gap-2 text-sm" onClick={() => setPreviewImage(null)}>
              <FiX size={20} /> Tutup
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-h-[75vh] w-auto rounded shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  )
}