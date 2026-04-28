"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  FiChevronLeft, FiTruck, 
  FiCreditCard, FiCheck, FiPackage, FiX, FiClock, 
  FiInfo
} from "react-icons/fi";
import { 
  FaFileInvoiceDollar, FaBox,
  FaStickyNote
} from "react-icons/fa";
import { toast } from "sonner";
import { formatRp, displayStatus, formatPhoneNumber } from "@/lib/utils"; // Pastikan displayStatus sudah di-export
import LoadingScreen from "@/components/ui/LoadingScreen";
import OrderItemsDetail from "@/components/order/OrderItemsDetail";

const REFUND_REASONS = [
  "Ingin mengubah alamat pengiriman",
  "Ingin mengubah rincian pesanan (warna, ukuran, dll)",
  "Menemukan harga yang lebih murah di tempat lain",
  "Berubah pikiran / Tidak ingin membeli lagi",
  "Lainnya",
];

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Refund
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/user/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        toast.error("Transaksi tidak ditemukan");
      }
    } catch (err) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || !id) return;
    fetchOrder();
  }, [id, router.isReady]);

  const handleRefundSubmit = async () => {
    if (!selectedReason) return toast.error("Silakan pilih alasan pembatalan");
    setIsSubmittingRefund(true);
    try {
      const res = await fetch(`/api/user/orders/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: order.invoice, reason: selectedReason }),
      });
      if (res.ok) {
        toast.success("Pengajuan pembatalan berhasil dikirim");
        setIsRefundModalOpen(false);
        fetchOrder();
      } else {
        toast.error("Gagal mengirim pengajuan");
      }
    } finally {
      setIsSubmittingRefund(false);
    }
  };


  useEffect(() => {
    if (!router.isReady || !id) return;
    fetchOrder();
  }, [id, router.isReady]);

  if (loading) return <LoadingScreen />;
  if (!order) return <div className="h-screen flex items-center justify-center font-bold text-gray-600 uppercase tracking-widest">TRANSACTION NOT FOUND</div>;

  // --- LOGIKA STATUS BARU ---
  const isFailed = order.status === "EXPIRED" || order.status === "CANCELLED";
  const isPaid = order.status === "PAID";
  const shipment = order.shipment;

  // Pengecekan Request (Pembatalan vs Retur)
  const isCancellation = !!order.cancellationRequest; // Sebelum kirim
  const isRefunding = !!order.refundRequest; // Setelah terima/kirim

  // 1. LOGIKA STEPPER DINAMIS
  const getSteps = () => {
    // Jika ada request pembatalan (Cancellation)
    if (isCancellation) {
      return [
        { label: "Diajukan", icon: <FaStickyNote />, active: true },
        { label: "Ditinjau", icon: <FiClock />, active: ["PENDING", "APPROVED"].includes(order.cancellationRequest.status) },
        { label: "Selesai", icon: <FiCheck />, active: order.cancellationRequest.status === "REFUNDED" },
      ];
    }

    // Jika pesanan Gagal/Expired (Bukan karena request)
    if (isFailed) {
      return [
        { label: "Pesanan Dibuat", icon: <FaFileInvoiceDollar />, active: true },
        { label: "Dibatalkan", icon: <FiX />, active: true, color: "text-red-500" },
      ];
    }

    return [
      { 
        label: "Dibuat", 
        icon: <FaFileInvoiceDollar />, 
        active: true 
      },
      { 
        label: "Dibayar", 
        icon: <FiCreditCard />, 
        active: isPaid || order.status === "REFUNDED" 
      },
      { 
        label: "Diproses", 
        icon: <FiPackage />, 
        active: isPaid && ["PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(shipment?.status) 
      },
      { 
        label: "Dikirim", 
        icon: <FiTruck />, 
        active: isPaid && ["SHIPPED", "DELIVERED"].includes(shipment?.status) 
      },
      { 
        label: "Selesai", 
        icon: <FaBox />, 
        active: shipment?.status === "DELIVERED" 
      },
    ];
  };

  const steps = getSteps();
  const activeCount = steps.filter(s => s.active).length;
  const progressWidth = steps.length > 1 ? ((activeCount - 1) / (steps.length - 1)) * 100 : 0;


  return (
    <div className="min-h-screen md:pt-3">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-black font-medium">
            <FiChevronLeft size={18} /> Kembali
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-0.5 space-y-0.5">
        
        {!isFailed && (
          <div className="bg-white p-6 md:p-10 flex justify-between relative overflow-hidden">
            <div className="absolute top-[44px] md:top-[75px] left-[12%] right-[12%] h-[4px] bg-gray-100 rounded-full" />
            <div 
              className="absolute top-[44px] md:top-[75px] left-[12%] h-[4px] bg-[#26aa99] transition-all duration-700 rounded-full" 
              style={{ width: `${progressWidth * 0.76}%` }} 
            />
            
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center flex-1 text-center">
                <div className={`w-10 h-10 md:w-18 md:h-18 rounded-full flex items-center justify-center text-lg md:text-xl border-[4px] border-white shadow-sm transition-all duration-500 ${step.active ? 'bg-zinc-900 text-white' : 'bg-white text-gray-300 border-gray-100'}`}>
                  {step.active && i < activeCount - 1 ? <FiCheck strokeWidth={4} /> : step.icon}
                </div>
                <p className={`mt-3 font-bold text-[10px] md:text-[12px] md:tracking-normal ${step.active ? 'text-black' : 'text-gray-300'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div> 
        )}

         {isFailed && (
          <div className="bg-white p-6 flex justify-between relative overflow-hidden">
            {/* Garis Abu-abu Latar */}
            <div className="absolute top-[44px] md:top-[50px] left-[25%] right-[25%] h-[2px] bg-gray-100 rounded-none" />
            
            {/* Garis Hitam Progress (Dibuat penuh untuk menghubungkan 2 titik) */}
            <div 
              className="absolute top-[44px] md:top-[50px] left-[25%] h-[2px] bg-zinc-950 transition-all duration-700 rounded-none" 
              style={{ width: `50%` }} 
            />
            
            {[
              { label: "Pesanan dibuat", icon: <FaFileInvoiceDollar />, active: true },
              { label: "Pesanan dibatalkan", icon: <FiX />, active: true },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center flex-1 text-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl border-[4px] border-white shadow-sm transition-all duration-500 ${step.active ? 'bg-zinc-950 text-white' : 'bg-white text-gray-300 border-gray-100'}`}>
                  {/* Titik pertama pakai Check jika sudah lewat, titik terakhir pakai X */}
                  {i === 0 ? <FiCheck strokeWidth={4} /> : <FiX strokeWidth={4} />}
                </div>
                <p className={`mt-3 font-bold text-[11px] md:text-[13px] md:tracking-normal ${step.active ? 'text-zinc-950' : 'text-gray-300'}`}>
                  {step.label}
                </p>
                {/* Tambahan info waktu di bawah label */}
                {i === 1 && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    {new Date(order.updatedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            ))}
          </div>
         )}

        {/* NOTIFIKASI STATUS TERAKHIR */}
        <div className="bg-[#fffdf4] p-3 border-b border-[#f8ebad] flex items-center gap-2">
            <FiInfo className="text-[#ee4d2d]" size={18} />
            <p className="text-[13px] text-gray-700 grow">
                {isRefunding ? (
                  `Status Refund: ${order.refundRequest.status === 'PENDING' ? 'Menunggu Persetujuan Admin' : order.refundRequest.status}`
                ) : (
                  <>
                    {order.status === "PENDING" && "Mohon segera selesaikan pembayaran Anda sebelum waktu habis."}
                    {order.status === "PAID" && "Pembayaran terverifikasi. pesanan akan segera proses."}
                    {order.status === "PROCESSING" && "Pesanan Anda sedang diproses."}
                    {order.status === "READY_TO_SHIP" && "Pesanan sudah dipacking & menunggu penjemputan kurir."}
                    {order.status === "SHIPPED" && "Pesanan Anda sedang dalam perjalanan oleh kurir."}
                    {order.status === "COMPLETED" && "Pesanan telah diterima. Terima kasih telah berbelanja!"}
                    {order.status === "CANCELLED" && "Pesanan ini telah dibatalkan"}
                    {order.status === "EXPIRED" && "Pesanan ini telah dibatalkan karena waktu pembayaran telah habis."}
                  </>
                )}
            </p>
            <div className="flex items-center justify-end gap-3">
              {order.status === "PENDING" && (
                <button onClick={() => router.push(`/payment/${order.invoice}`)} className="px-8 py-2.5 bg-[#ee4d2d] text-white rounded-none font-black uppercase text-[11px] shadow-sm hover:brightness-110 transition-all">
                    Bayar Sekarang
                </button>
              )}
              {(order.status === "PAID" || order.status === "READY_TO_SHIP") && !order.refundRequest && (
                <button onClick={() => setIsRefundModalOpen(true)} className="px-6 py-2.5 border border-zinc-200 text-zinc-500 rounded-none font-black uppercase text-[11px] hover:bg-zinc-50 transition-all">
                  Ajukan Pembatalan
                </button>
              )}
            </div>
        </div>

        {/* INFORMASI PENGIRIMAN */}
        <div className="bg-white p-6 shadow-sm border-t-4 border-surel">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
               <h3 className="text-[14px] font-bold text-black mb-2 flex items-center gap-2">
                 <FiTruck className="text-[#26aa99]" /> Alamat Pengiriman
               </h3>
               <p className="font-bold text-gray-800 text-[13px]">
                 {order.shippingAddress?.recipientName || order.recipientName}
               </p>
               <p className="text-gray-500 text-[12px] mb-2">
                 {formatPhoneNumber(order.shippingAddress?.recipientPhone || order.recipientPhone)}
               </p>
               <p className="text-gray-600 text-[12px] leading-relaxed">
                {order.shippingAddress?.fullAddress} <br />
                {order.shippingAddress?.district}, {order.shippingAddress?.city} <br />
                {order.shippingAddress?.province}, {order.shippingAddress?.postalCode}
               </p>
            </div>
            
            <div className="md:col-span-7 md:border-l border-gray-100 md:pl-8">
               <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4 flex justify-between">
                 <span>Riwayat Status</span>
               </p>
               <div className="relative space-y-2 before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                  {order.history?.map((hist: any, index: number) => (
                    <div key={hist.id} className={`relative pl-2`}>
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full flex items-center justify-center z-10 ${index === 0 ? 'bg-[#26aa99] shadow-md' : 'bg-gray-200'}`}>
                        {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                      </div>
                      <div className="flex flex-col md:flex-row-reverse justify-end md:gap-5 pl-3">
                        <p className="text-[11px] text-gray-700 mt-0.5 leading-snug">{hist.notes || `Status pesanan: ${hist.status}`}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{new Date(hist.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <OrderItemsDetail order={order} isFailed={isFailed} />
      </div>

      {/* MODAL REFUND */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-none shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="border-b border-gray-100 p-5 flex items-center justify-between bg-white">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">Ajukan Pembatalan</h2>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-zinc-400 hover:text-black"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 bg-zinc-50 p-4 border border-zinc-100">
                <FiInfo size={16} className="mt-0.5 text-zinc-900 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Penting</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">Dana dikembalikan setelah Admin menyetujui pengajuan. Proses verifikasi 1-3 hari kerja.</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Pilih Alasan :</p>
                {REFUND_REASONS.map((r) => (
                  <label key={r} className={`flex items-center gap-3 p-4 border transition-all cursor-pointer ${selectedReason === r ? 'border-zinc-900 bg-zinc-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="radio" name="refund_reason" value={r} onChange={(e) => setSelectedReason(e.target.value)} checked={selectedReason === r} className="w-4 h-4 accent-zinc-900" />
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={handleRefundSubmit} disabled={isSubmittingRefund || !selectedReason} className="w-full py-4 bg-zinc-900 text-white font-black uppercase text-[11px] tracking-[0.3em] disabled:opacity-20 transition-all">
                {isSubmittingRefund ? "Memproses..." : "Konfirmasi Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .border-surel {
          border-image: repeating-linear-gradient(45deg, #ee4d2d, #ee4d2d 33px, transparent 33px, transparent 41px, #000000 41px, #000000 74px, transparent 74px, transparent 82px) 4;
        }
      `}</style>
    </div>
  );
}