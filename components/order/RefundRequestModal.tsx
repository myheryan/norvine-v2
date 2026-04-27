"use client";

import { useState } from "react";
import { FiX, FiInfo, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";

const REFUND_REASONS = [
  "Ingin mengubah alamat pengiriman",
  "Ingin mengubah rincian pesanan (warna, ukuran, dll)",
  "Menemukan harga yang lebih murah di tempat lain",
  "Berubah pikiran / Tidak ingin membeli lagi",
  "Lainnya",
];

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void; // Untuk refresh data di halaman utama setelah submit
}

export default function RefundRequestModal({ isOpen, onClose, order, onSuccess }: RefundRequestModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    if (!reason) return toast.error("Silakan pilih alasan pembatalan");
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/user/orders/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          invoice: order.invoice, 
          reason: reason 
        }),
      });

      if (res.ok) {
        toast.success("Pengajuan pembatalan berhasil dikirim");
        onSuccess(); // Refresh data
        onClose();   // Tutup modal
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Gagal mengirim pengajuan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-none shadow-2xl relative overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="border-b border-gray-100 p-5 flex items-center justify-between bg-white">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">
            Ajukan Pembatalan
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-black transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* INFORMASI SINGKAT */}
          <div className="flex items-start gap-3 bg-zinc-50 p-4 border border-zinc-100">
            <FiInfo size={16} className="mt-0.5 text-zinc-900 shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Penting</p>
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                Dana akan dikembalikan setelah Admin menyetujui pengajuan. Proses verifikasi memakan waktu 1-3 hari kerja.
              </p>
            </div>
          </div>

          {/* DAFTAR ALASAN */}
          <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Pilih Alasan :</p>
            {REFUND_REASONS.map((r) => (
              <label 
                key={r} 
                className={`flex items-center gap-3 p-4 border transition-all cursor-pointer rounded-none ${
                  reason === r 
                  ? 'border-zinc-900 bg-zinc-50' 
                  : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="refund_reason" 
                  value={r} 
                  onChange={(e) => setReason(e.target.value)} 
                  checked={reason === r} 
                  className="w-4 h-4 accent-zinc-900" 
                />
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight leading-none">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* FOOTER MODAL */}
        <div className="p-6 pt-2">
          <button 
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="w-full py-4 bg-zinc-900 text-white font-black uppercase text-[11px] tracking-[0.3em] shadow-lg disabled:opacity-20 transition-all active:scale-[0.98]"
          >
            {submitting ? "Memproses..." : "Konfirmasi Pengajuan"}
          </button>
          <button 
            onClick={onClose}
            className="w-full mt-2 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
          >
            Kembali
          </button>
        </div>

      </div>
    </div>
  );
}