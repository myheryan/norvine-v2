"use client";

import { useState } from "react";
import { FiX, FiRotateCcw, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  "Barang rusak atau cacat produksi",
  "Produk tidak sesuai deskripsi / foto",
  "Jumlah produk yang diterima kurang",
  "Produk yang dikirim salah variasi",
];

export default function ReturnOrderModal({ isOpen, onClose, order, onSuccess }: ReturnModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    if (!reason) return toast.error("Silakan pilih alasan pengembalian");
    setLoading(true);

    try {
      const res = await fetch("/api/user/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: order.invoice, reason }),
      });

      if (res.ok) {
        toast.success("Pengajuan retur barang berhasil dikirim");
        onSuccess();
        onClose();
      } else {
        toast.error("Gagal mengirim pengajuan retur");
      }
    } catch (error) {
      toast.error("Kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-none shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600">Pengembalian Barang (Retur)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><FiX size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-orange-50 p-3 border border-orange-100 flex gap-2 items-start">
            <FiInfo className="text-orange-500 mt-0.5 shrink-0" size={14} />
            <p className="text-[10px] text-orange-700 font-bold uppercase leading-relaxed">
              Pastikan kemasan produk masih ada dan lampirkan bukti video unboxing saat dihubungi admin.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Alasan Pengembalian:</p>
            {RETURN_REASONS.map((r) => (
              <label key={r} className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${reason === r ? 'border-orange-600 bg-orange-50/30' : 'border-gray-50 hover:bg-gray-50'}`}>
                <input type="radio" name="return_reason" className="w-4 h-4 accent-orange-600" onChange={() => setReason(r)} checked={reason === r} />
                <span className="text-[11px] text-zinc-800 font-bold uppercase tracking-tight">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 pt-0">
          <button 
            disabled={loading || !reason} 
            onClick={handleSubmit} 
            className="w-full py-4 text-[11px] font-black bg-orange-600 text-white uppercase rounded-none tracking-[0.3em] shadow-lg disabled:opacity-20 transition-all active:scale-95"
          >
            {loading ? "SULIT PROSES..." : "AJUKAN RETUR SEKARANG"}
          </button>
        </div>
      </div>
    </div>
  );
}