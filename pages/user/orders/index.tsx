"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FiCopy, FiInfo, FiShoppingBag, FiAlertCircle, FiX } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { formatRp, getCloudinaryImage } from "@/lib/utils";
import { OrderActionButton } from "@/components/order/OrderActionButton"; 
import TrackingModal from "@/components/order/TrackingModal";
import LoadingScreen from "@/components/ui/LoadingScreen";

const TABS = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Belum Bayar" },
  { id: "PAID", label: "Diproses" },
  { id: "SHIPPED", label: "Dikirim" },
  { id: "COMPLETED", label: "Selesai" },
];

// Opsi Alasan
const CANCEL_REASONS = [
  "Ingin mengubah alamat pengiriman",
  "Ingin mengubah produk / variasi",
  "Menemukan harga yang lebih murah",
  "Metode pembayaran tidak sesuai",
  "Berubah pikiran",
];

const COMPLAIN_REASONS = [
  "Barang rusak / pecah",
  "Produk tidak sesuai deskripsi",
  "Jumlah produk kurang",
  "Paket belum diterima (Status Selesai)",
];

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("ALL");
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);

  // State untuk Fitur Baru (Cancel & Complain)
  const [modalType, setModalType] = useState<"CANCEL" | "COMPLAIN" | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session) return;
      try {
        const res = await fetch(`/api/user/orders?status=ALL`);
        const data = await res.json();
        setAllTransactions(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error("Gagal memuat pesanan");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchOrders();
  }, [session]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return allTransactions;
    return allTransactions.filter((trx) => {
      if (activeTab === "PAID") return ["PAID", "SETTLEMENT", "CAPTURE", "PROCESSING"].includes(trx.status);
      return trx.status === activeTab;
    });
  }, [activeTab, allTransactions]);

  // Handler Submit Action (Cancel/Complain)
const handleActionSubmit = async () => {
  if (!reason) return toast.error("Silakan pilih alasan");
  setIsSubmitting(true);
  
  const isCancel = modalType === "CANCEL";
  const endpoint = isCancel ? "/api/user/orders/cancel" : "/api/user/orders/complain";
  
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice: selectedTrx.invoice, reason }),
    });
    
    if (res.ok) {
      if (isCancel) {
        toast.success("Pesanan berhasil dibatalkan");
        setModalType(null);
        router.reload();
      } else {
        // LOGIKA REDIRECT WHATSAPP
        const phoneNumber = "6281370008002"; // Ganti dengan nomor WA Norvine (awalan 62)
        const message = `Halo Norvine, saya ingin mengajukan komplain.\n\n` +
                        `*No. Invoice:* ${selectedTrx.invoice}\n` +
                        `*Alasan:* ${reason}\n\n` +
                        `Mohon bantuannya untuk proses lebih lanjut. Terima kasih.`;
        
        const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        toast.success("Membuka WhatsApp...");
        setModalType(null);
        
        // Redirect ke WA di tab baru
        window.open(waLink, '_blank');
      }
    } else {
      const err = await res.json();
      toast.error(err.error || "Gagal memproses permintaan");
    }
  } catch (e) {
    toast.error("Terjadi kesalahan koneksi");
  } finally {
    setIsSubmitting(false);
  }
};

  const copyInvoice = (e: React.MouseEvent, inv: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    navigator.clipboard.writeText(inv);
    toast.success("Invoice disalin");
  };

  const handlePayment = (e: React.MouseEvent, trx: any) => {
    e.preventDefault(); 
    e.stopPropagation();
    router.push(`/payment/${trx.invoice}`);
  };

  const handleOpenTracking = (trx: any) => {
    setSelectedTrx(trx);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen pb-10 bg-gray-50/30">
      <div className="max-w-4xl mx-auto sm:px-2">
        
        <div className="md:mt-4 bg-white shadow-sm flex border-b border-gray-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] py-3 text-sm text-center transition-all border-b-2 ${
                activeTab === tab.id 
                  ? "border-b-4 border-zinc-950 text-zinc-950 font-bold" 
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-2">
          {loading ? (
            <LoadingScreen />
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white py-24 flex flex-col items-center justify-center text-center px-4 shadow-sm">
              <FiShoppingBag size={48} className="text-gray-100 mb-3" />
              <p className="text-gray-400 font-medium italic">Belum ada transaksi di kategori ini.</p>
            </div>
          ) : (
            filteredTransactions.map((trx) => {
              const isExpired = trx.status === "EXPIRED" || trx.status === "CANCELLED";
              
              return (
                <div key={trx.id} className={`bg-white shadow-sm border border-gray-100 ${isExpired ? "opacity-70" : ""}`}>
                  
                  <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                    <span 
                      className="text-[14px] text-gray-900 font-semibold cursor-pointer hover:text-zinc-600 flex items-center gap-1" 
                      onClick={(e) => copyInvoice(e, trx.invoice)}
                    >
                      {trx.invoice} <FiCopy size={14} className="text-gray-300" />
                    </span>
                    <span className={`font-bold text-[12px] uppercase tracking-tight ${isExpired ? "text-red-400" : "text-emerald-600"}`}>
                      {trx.status === "PENDING" ? "Menunggu Pembayaran" : trx.status}
                    </span>
                  </div>

                  <Link href={`/user/orders/${trx.invoice}`} className="block hover:bg-gray-50/30 transition-colors">
                    {trx.items?.slice(0, 1).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 px-3 py-3">
                        <div className={`relative h-14 w-14 bg-gray-50 border border-gray-100 shrink-0 ${isExpired ? "grayscale" : ""}`}>
                          <Image 
                            src={getCloudinaryImage(item.product?.thumbnailUrl || "/placeholder.png", 200, 200)} 
                            alt="product" fill className="object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base text-gray-800 truncate font-medium">{item.product?.name}</h4>
                          <p className="text-gray-400 text-[11px]">
                            Variasi: {item.variant?.name || "-"}
                          </p>
                          <div className="text-sm font-semibold text-zinc-700">
                            {formatRp(item.priceAtBuy)} x{item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                    {trx.items?.length > 1 && (
                      <div className="px-3 pb-3 -mt-1">
                        <p className="text-[12px] text-zinc-500 font-medium italic">
                          + {trx.items.length - 1} produk lainnya
                        </p>
                      </div>
                    )}
                  </Link>

                  <div className="px-3 py-3 border-t border-dashed border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
                    <div className="flex flex-row grow justify-between items-center text-gray-400 text-[12px]">
                      <div className="flex flex-row gap-1">
                        {isExpired ? <FiAlertCircle size={14} className="text-red-400" /> : <FiInfo size={14} className="text-sky-400" />}
                        <span className="text-[11px] font-medium">
                          {trx.status === "PENDING" ? "Segera selesaikan pembayaran" : 
                            isExpired ? "Pesanan dibatalkan sistem" : "Pesanan Anda sedang diproses"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end lg:px-4">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Total Pesanan</span>
                        <span className={`text-[18px] font-black tracking-tighter ${isExpired ? "text-gray-400" : "text-zinc-900"}`}>
                          {formatRp(trx.totalAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                        <OrderActionButton 
                          trx={trx} 
                          handlePayment={handlePayment} 
                          onOpenTracking={handleOpenTracking}
                          onCancel={() => { setSelectedTrx(trx); setModalType("CANCEL"); }} // Logic buka modal
                          onComplain={() => { setSelectedTrx(trx); setModalType("COMPLAIN"); }} // Logic buka modal
                        />
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL PILIHAN ALASAN (Sesuai style Norvine: No Rounded) */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-sm rounded-none shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-tight">
                {modalType === "CANCEL" ? "Batalkan Pesanan" : "Ajukan Komplain"}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400"><FiX size={20} /></button>
            </div>
            
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Pilih Alasan:</p>
              {(modalType === "CANCEL" ? CANCEL_REASONS : COMPLAIN_REASONS).map((r) => (
                <label 
                  key={r} 
                  className={`flex items-center gap-3 p-3 cursor-pointer border ${reason === r ? 'border-zinc-900 bg-zinc-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <input 
                    type="radio" 
                    name="reason" 
                    className="w-4 h-4 accent-zinc-900" 
                    onChange={() => setReason(r)} 
                    checked={reason === r}
                  />
                  <span className="text-xs text-gray-700 font-medium">{r}</span>
                </label>
              ))}
            </div>

            <div className="p-4 flex gap-2">
              <button 
                onClick={() => setModalType(null)}
                className="flex-1 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-100 transition-all"
              >
                Kembali
              </button>
              <button 
                disabled={isSubmitting || !reason}
                onClick={handleActionSubmit}
                className="flex-1 py-3 text-xs font-bold bg-zinc-900 text-white uppercase tracking-widest transition-all disabled:opacity-30"
              >
                {isSubmitting ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <TrackingModal 
        isOpen={isTrackingOpen} 
        onClose={() => setIsTrackingOpen(false)} 
        waybill={selectedTrx?.waybill} 
        invoice={selectedTrx?.invoice}
      />
    </div>
  );
}