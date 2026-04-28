"use client";

import { useState } from "react";
import { FiX, FiInfo, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  "Ingin mengubah alamat pengiriman",
  "Ingin mengubah rincian pesanan (warna, ukuran, dll)",
  "Metode pembayaran tidak sesuai / ingin diganti",
  "Menemukan harga yang lebih murah di tempat lain",
  "Berubah pikiran / Tidak ingin membeli lagi",
];

export default function CancelOrderModal({ isOpen, onClose, order, onSuccess }: CancelModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  // Cek apakah ini pembatalan otomatis (unpaid) atau butuh approval (paid)
  const isPaid = ["PAID", "PROCESSING", "READY_TO_SHIP"].includes(order.status);

  const handleSubmit = async () => {
    if (!reason) return toast.error("Silakan pilih alasan pembatalan");
    setLoading(true);

    try {
      // Endpoint dibedakan sesuai status (Bisa disatukan di backend, tapi di sini kita siapkan logikanya)
      const endpoint = isPaid ? "/api/user/orders/cancel" : "/api/user/orders/cancel";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: order.invoice, reason }),
      });

      if (res.ok) {
        toast.success(isPaid ? "Permintaan pembatalan terkirim ke Admin" : "Pesanan berhasil dibatalkan");
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal memproses pembatalan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-none shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-zinc-900">
            {isPaid ? "Ajukan Pembatalan Dana" : "Batalkan Pesanan"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><FiX size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          {isPaid && (
            <div className="bg-red-50 p-3 border border-red-100 flex gap-2 items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={14} />
              <p className="text-xs text-red-700 leading-relaxed">
                Pesanan sudah dibayar. Pembatalan memerlukan persetujuan Admin Norvine sebelum dana dikembalikan.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-black font-semibold">Pilih Alasan:</p>
            {CANCEL_REASONS.map((r) => (
              <label key={r} className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${reason === r ? 'border-zinc-900 bg-zinc-50' : 'border-gray-50 hover:bg-gray-50'}`}>
                <input type="radio" name="cancel_reason" className="w-4 h-4 accent-zinc-900" onChange={() => setReason(r)} checked={reason === r} />
                <span className="text-xs text-zinc-800 tracking-tight">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-base font-black text-gray-400 border border-gray-100 rounded-none">Tutup</button>
          <button 
            disabled={loading || !reason} 
            onClick={handleSubmit} 
            className="flex-1 py-2 text-base font-black bg-zinc-950 text-white rounded-none disabled:opacity-20"
          >
            {loading ? "Processing..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
}