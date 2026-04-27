"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiChevronLeft, FiCopy, FiChevronUp, FiChevronDown, FiClock, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { formatRp } from "@/lib/utils";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Menggunakan komponen milik Bapak
import OrderItemsDetail from "@/components/order/OrderItemsDetail";

export default function CancellationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/user/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      toast.error("Gagal memuat rincian pembatalan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || !id) return;
    fetchOrder();
  }, [id, router.isReady]);

  if (loading) return <LoadingScreen />;
  if (!order) return <div className="h-screen flex items-center justify-center font-bold text-gray-400">Data tidak ditemukan</div>;

  const cancelReq = order.cancellationRequest;
  const isPending = cancelReq?.status === "PENDING";
  const isApproved = ["APPROVED", "REFUNDED"].includes(cancelReq?.status);
  const isRefunded = cancelReq?.status === "REFUNDED";

  // Stepper sesuai image_d6dadc.png
  const steps = [
    { label: "Pengajuan", active: true },
    { label: "Verifikasi Admin", active: isPending || isApproved },
    { label: "Refund Selesai", active: isRefunded },
  ];

  const activeCount = steps.filter(s => s.active).length;
  const progressWidth = ((activeCount - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-100/60 lg:py-8 pb-10 font-sans text-zinc-900">
      
      {/* NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-black font-medium text-[13px]">
            <FiChevronLeft size={20} /> Kembali
          </button>
          <div className="text-right text-[11px] text-gray-600 font-medium">
            Diminta pada: {new Date(cancelReq?.createdAt || order.updatedAt).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto md:mt-1">
        
        {!isPending && (
          <div className="bg-white px-4 py-3 md:py-5 border-b border-gray-100">
  <div className="max-w-3xl mx-auto relative">
    
    {/* 1. Garis Abu (Latar) - Dibuat presisi di antara titik */}
    <div className="absolute top-[8px] left-[15%] right-[15%] h-[1.5px] bg-gray-100" />
    
    {/* 2. Garis Hitam (Progress) - Z-index 10 agar di bawah kotak */}
    <div 
      className="absolute top-[8px] left-[15%] h-[1.5px] bg-zinc-800 transition-all duration-1000 ease-in-out z-10" 
      style={{ width: `${progressWidth * 0.8}%` }} 
    />

    {/* 3. Item Stepper */}
    <div className="w-full relative z-20 flex justify-between items-start">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          
          {/* Kotak Tajam (Square Marker) */}
          <div className={`w-4 h-4 rounded-none border-2 border-white ring-1 transition-all duration-500 ${
            step.active ? 'bg-zinc-800 ring-zinc-800 scale-110' : 'bg-gray-200 ring-gray-100'
          }`} />
          
          {/* Label Sentence Case (Bukan Uppercase) */}
          <span className={`mt-4 text-[11px] md:text-[13px] font-medium text-center px-1 leading-tight ${
            step.active ? 'text-zinc-900' : 'text-gray-300'
          }`}>
            {step.label}
          </span>
          
        </div>
      ))}
    </div>
  </div>
</div>
        )}


        <div className="bg-[#fffdf4] p-3 border-b border-[#f8ebad] flex items-start gap-2">
           <div className="mt-1">
             {isRefunded ? (
               <FiCheck className="text-[#ee4d2d]" size={20} strokeWidth={3} />
             ) : (
               <FiClock className="text-[#ee4d2d] animate-pulse" size={20} />
             )}
           </div>
           <div>
             <h2 className="text-[17px] font-semibold text-[#ee4d2d]">
               {isRefunded ? "Pengembalian dana selesai" : isApproved ? "Pembatalan disetujui" : "Menunggu persetujuan admin"}
             </h2>
             <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
               {isRefunded 
                 ? `Dana sebesar ${formatRp(cancelReq.amount)} telah berhasil dikembalikan ke ${order.paymentMethod}.` 
                 : "Halo, admin Norvine sedang memeriksa pengajuan Anda. Mohon tunggu proses verifikasi selesai."}
             </p>
           </div>
        </div>

        {/* DETAIL PRODUK - Menggunakan komponen Bapak */}
        <OrderItemsDetail order={order} isFailed={true} />

         <div className="bg-white divide-y divide-gray-50 border-t border-gray-100">

           {cancelReq?.amount > 0 && (
            <div className="px-4 py-2 flex justify-between items-center text-[13px]">
                <span className="text-gray-500">Jumlah pengembalian dana</span>
                <span className="text-[20px] font-bold text-[#ee4d2d] tracking-tighter">
                  {formatRp(cancelReq?.amount)}
                </span>
            </div>
           )}
           <div className="px-4 py-2 flex justify-between items-center text-[13px]">
              <span className="text-gray-500">Pengembalian dana ke</span>
              <span className="text-zinc-800 font-medium flex items-center gap-1">
                {order.paymentMethod}
              </span>
           </div>
           <div className="px-4 py-2 flex justify-between items-center text-[13px]">
              <span className="text-gray-500">Diminta oleh</span>
              <span className="text-zinc-800 font-medium">Pembeli</span>
           </div>
           <div className="px-4 py-2 flex justify-between items-center text-[13px]">
              <span className="text-gray-500">No. Pesanan</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(order.invoice); toast.success("Invoice disalin"); }}
                className="text-[#ee4d2d] font-bold flex items-center gap-1"
              >
                {order.invoice} <FiCopy className="text-gray-300" size={14} />
              </button>
           </div>
        </div>

        {/* ALASAN SECTION */}
        <div className="bg-white p-5 border-t border-gray-100">
           <p className="text-[14px] text-zinc-800">
             <span className="font-bold mr-1">Alasan:</span> 
             {cancelReq?.reason || "Ingin mengubah rincian pesanan"}
           </p>
           {cancelReq?.adminNotes && (
             <div className="mt-3 p-4 bg-zinc-950 text-white rounded-none">
                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Catatan admin:</p>
                <p className="text-[12px] leading-relaxed">{cancelReq.adminNotes}</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}