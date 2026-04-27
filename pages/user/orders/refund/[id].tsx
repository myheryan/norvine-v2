"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiChevronLeft, FiClock, FiCheck, FiInfo } from "react-icons/fi";
import { FaStickyNote } from "react-icons/fa";
import { formatRp } from "@/lib/utils";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function RefundPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;
    const fetchOrder = async () => {
      const res = await fetch(`/api/user/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.refundRequest) {
          router.replace(`/user/orders/${id}`);
        } else {
          setOrder(data);
          setLoading(false);
        }
      }
    };
    fetchOrder();
  }, [id, router.isReady]);

  if (loading) return <LoadingScreen />;

  const refundSteps = [
    { label: "Diajukan", icon: <FaStickyNote />, active: true },
    { label: "Ditinjau", icon: <FiClock />, active: ["PENDING", "APPROVED", "COMPLETED"].includes(order.refundRequest.status) },
    { label: "Selesai", icon: <FiCheck />, active: order.refundRequest.status === "COMPLETED" },
  ];
  const activeCount = refundSteps.filter(s => s.active).length;
  const progressWidth = ((activeCount - 1) / (refundSteps.length - 1)) * 100;

  return (
    <div className="min-h-screen md:pt-3">
      <div className="bg-white border-b border-gray-100">
        {/* Stepper khusus Pengembalian Barang (Refund/Retur) */}
<div className="bg-white p-6 md:p-10 flex justify-between relative overflow-hidden">
  {/* 1. Garis Abu-abu Latar */}
  <div className="absolute top-[44px] md:top-[75px] left-[15%] right-[15%] h-[2px] bg-gray-100 rounded-none" />
  
  {/* 2. Garis Hitam Progress - Dinamis sesuai status refund */}
  <div 
    className="absolute top-[44px] md:top-[75px] left-[15%] h-[2px] bg-zinc-950 transition-all duration-700 rounded-none" 
    style={{ 
      width: order.refundRequest.status === "REFUNDED" ? "70%" : 
             ["APPROVED", "PENDING"].includes(order.refundRequest.status) ? "35%" : "0%" 
    }} 
  />
  
  {[
    { 
      label: "Pengajuan retur", 
      icon: <FiInfo />, 
      active: true 
    },
    { 
      label: "Verifikasi admin", 
      icon: <FiClock />, 
      active: ["PENDING", "APPROVED", "REFUNDED"].includes(order.refundRequest.status) 
    },
    { 
      label: "Refund selesai", 
      icon: <FiCheck />, 
      active: order.refundRequest.status === "REFUNDED" 
    },
  ].map((step, i) => (
    <div key={i} className="relative z-10 flex flex-col items-center flex-1 text-center">
      <div className={`w-10 h-10 md:w-18 md:h-18 rounded-none flex items-center justify-center text-lg md:text-xl border-[4px] border-white shadow-sm transition-all duration-500 ${step.active ? 'bg-zinc-950 text-white' : 'bg-white text-gray-300 border-gray-100'}`}>
        {step.active && i < 2 ? <FiCheck strokeWidth={4} /> : step.icon}
      </div>
      <p className={`mt-3 font-bold text-[11px] md:text-[13px] leading-tight ${step.active ? 'text-zinc-950' : 'text-gray-300'}`}>
        {step.label}
      </p>
      {/* Info tambahan jika sudah selesai */}
      {i === 2 && step.active && (
        <p className="text-[10px] text-emerald-600 font-medium mt-1">Dana dikirim</p>
      )}
    </div>
  ))}
</div>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center"><button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 font-medium"><FiChevronLeft size={18} /> Kembali</button></div>
      </div>
      <div className="max-w-4xl mx-auto mt-0.5 space-y-0.5">
        <div className="bg-white p-10 flex justify-between relative overflow-hidden">
          <div className="absolute top-[75px] left-[15%] right-[15%] h-[4px] bg-gray-100 rounded-full" />
          <div className="absolute top-[75px] left-[15%] h-[4px] bg-[#26aa99] transition-all duration-700 rounded-full" style={{ width: `${progressWidth * 0.7}%` }} />
          {refundSteps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center flex-1">
              <div className={`w-18 h-18 rounded-full flex items-center justify-center text-xl border-[4px] border-white shadow-sm ${step.active ? 'bg-zinc-900 text-white' : 'bg-white text-gray-300'}`}>{step.icon}</div>
              <p className={`mt-3 font-bold text-[12px] uppercase ${step.active ? 'text-black' : 'text-gray-300'}`}>{step.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#fffdf4] p-6 border-b border-[#f8ebad] flex items-center gap-3">
          <FiInfo className="text-[#ee4d2d]" size={18} />
          <p className="text-[13px] text-gray-700 font-bold uppercase">Status Refund: {order.refundRequest.status}</p>
        </div>
        <div className="bg-white p-6 shadow-sm border-t-4 border-zinc-900">
           <p className="text-[11px] font-black text-zinc-400 uppercase mb-4 tracking-widest">Detail Refund</p>
           <div className="grid grid-cols-2 gap-4 uppercase">
              <div><p className="text-[10px] text-gray-400 font-bold">Alasan</p><p className="font-bold text-zinc-800">{order.refundRequest.reason}</p></div>
              <div><p className="text-[10px] text-gray-400 font-bold">Estimasi Dana</p><p className="font-black text-[#ee4d2d] text-[18px]">{formatRp(order.refundRequest.amount)}</p></div>
           </div>
        </div>
      </div>
    </div>
  );
}