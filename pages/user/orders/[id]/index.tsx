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
import { formatRp, displayStatus, formatPhoneNumber } from "@/lib/utils";
import LoadingScreen from "@/components/ui/LoadingScreen";
import OrderItemsDetail from "@/components/order/OrderItemsDetail";
import CancelOrderModal from "@/components/order/CancelOrderModal";
import { useSession } from "next-auth/react";

export default function OrderDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const fetchOrder = async () => {
    if (!session || !id) return;
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
    if (!router.isReady || !id || !session) return;
    fetchOrder();
  }, [id, router.isReady, session]);

  if (loading) return <LoadingScreen />;
  if (!order) return <div className="h-screen flex items-center justify-center font-bold text-gray-600 uppercase tracking-widest">TRANSACTION NOT FOUND</div>;

  // --- LOGIKA STATUS ---
  const isFailed = order.status === "EXPIRED" || order.status === "CANCELLED";
  const isPaid = order.status === "PAID";
  const shipment = order.shipment;
  const isCancellationRequested = !!order.cancellationRequest;
  const isRefunding = !!order.refundRequest;

  // 1. LOGIKA STEPPER DINAMIS
  const getSteps = () => {
    if (isCancellationRequested) {
      return [
        { label: "Diajukan", icon: <FaStickyNote />, active: true },
        { label: "Ditinjau", icon: <FiClock />, active: ["PENDING", "APPROVED"].includes(order.cancellationRequest.status) },
        { label: "Selesai", icon: <FiCheck />, active: order.cancellationRequest.status === "REFUNDED" },
      ];
    }

    if (isFailed) {
      return [
        { label: "Pesanan dibuat", icon: <FaFileInvoiceDollar />, active: true },
        { label: "Pesanan dibatalkan", icon: <FiX />, active: true },
      ];
    }

    return [
      { label: "Dibuat", icon: <FaFileInvoiceDollar />, active: true },
      { label: "Dibayar", icon: <FiCreditCard />, active: isPaid || order.status === "REFUNDED" },
      { label: "Diproses", icon: <FiPackage />, active: isPaid && ["PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(shipment?.status) },
      { label: "Dikirim", icon: <FiTruck />, active: isPaid && ["SHIPPED", "DELIVERED"].includes(shipment?.status) },
      { label: "Selesai", icon: <FaBox />, active: shipment?.status === "DELIVERED" },
    ];
  };

  const steps = getSteps();
  const activeCount = steps.filter(s => s.active).length;
  const progressWidth = steps.length > 1 ? ((activeCount - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen md:pt-3 bg-gray-50/50">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-black font-medium transition-colors">
            <FiChevronLeft size={18} /> Kembali
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Detail Transaksi</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-0.5 space-y-0.5">
        
        {/* STEPPER VISUAL */}
        <div className="bg-white p-6 md:p-10 flex justify-between relative overflow-hidden">
          <div className="absolute top-[44px] md:top-[75px] left-[12%] right-[12%] h-[4px] bg-gray-100 rounded-full" />
          <div 
            className="absolute top-[44px] md:top-[75px] left-[12%] h-[4px] bg-[#26aa99] transition-all duration-700 rounded-full" 
            style={{ width: `${progressWidth * 0.76}%` }} 
          />
          
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center flex-1 text-center">
              <div className={`w-10 h-10 md:w-18 md:h-18 rounded-full flex items-center justify-center text-lg md:text-xl border-[4px] border-white shadow-sm transition-all duration-500 ${step.active ? 'bg-zinc-900 text-white' : 'bg-white text-gray-300 border-gray-100'}`}>
                {step.active && i < activeCount - 1 && !isFailed ? <FiCheck strokeWidth={4} /> : step.icon}
              </div>
              <p className={`mt-3 font-bold text-[10px] md:text-[12px] ${step.active ? 'text-black' : 'text-gray-300'}`}>
                {step.label}
              </p>
            </div>
          ))}
        </div> 

        {/* ALERT NOTIFIKASI STATUS */}
        <div className="bg-[#fffdf4] p-4 border-b border-[#f8ebad] flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 grow">
                <FiInfo className="text-[#ee4d2d] shrink-0" size={18} />
                <p className="text-[13px] text-gray-700">
                    {isCancellationRequested ? (
                        `Permintaan Pembatalan: ${order.cancellationRequest.status === 'PENDING' ? 'Sedang ditinjau oleh Admin' : order.cancellationRequest.status}`
                    ) : isRefunding ? (
                        `Status Refund: ${order.refundRequest.status === 'PENDING' ? 'Menunggu Persetujuan Admin' : order.refundRequest.status}`
                    ) : (
                        displayStatus(order.status, shipment?.status)
                    )}
                </p>
            </div>
            <div className="flex items-center justify-end gap-3 w-full md:w-auto">
              {order.status === "PENDING" && (
                <button onClick={() => router.push(`/payment/${order.invoice}`)} className="w-full md:w-auto px-8 py-2.5 bg-[#ee4d2d] text-white font-black uppercase text-[11px] shadow-sm hover:brightness-110 transition-all">
                    Bayar Sekarang
                </button>
              )}
              {/* Tombol pembatalan hanya muncul jika sudah PAID tapi belum dikirim */}
              {isPaid && (shipment?.status === "PENDING" || shipment?.status === "PROCESSING") && !isCancellationRequested && (
                <button onClick={() => setIsCancelOpen(true)} className="w-full md:w-auto px-6 py-2.5 border border-zinc-200 text-zinc-500 font-black uppercase text-[11px] hover:bg-zinc-50 transition-all">
                  Ajukan Pembatalan
                </button>
              )}
            </div>
        </div>

        {/* INFORMASI PENGIRIMAN & RIWAYAT */}
        <div className="bg-white p-6 shadow-sm  border-t-4 border-surel">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
               <h3 className="text-[14px] font-bold text-black mb-3 flex items-center gap-2">
                 <FiTruck className="text-[#26aa99]" /> Alamat Pengiriman
               </h3>
               <div className="">
                  <p className="font-bold text-gray-800 text-[13px]">
                    {order.shippingAddress?.recipientName}
                  </p>
                  <p className="text-gray-500 text-[12px] mb-2">
                    {formatPhoneNumber(order.shippingAddress?.recipientPhone)}
                  </p>
                  <p className="text-gray-600 text-[12px] leading-relaxed">
                    {order.shippingAddress?.fullAddress} <br />
                    {order.shippingAddress?.district}, {order.shippingAddress?.city},
                    {order.shippingAddress?.province}, {order.shippingAddress?.postalCode}
                  </p>
               </div>
            </div>
            
            <div className="md:col-span-7 md:border-l border-gray-100 md:pl-8">
               <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">
                 Riwayat Status
               </p>
               <div className="relative space-y-4 before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                  {order.history?.map((hist: any, index: number) => (
                    <div key={hist.id} className="relative pl-6">
                      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full flex items-center justify-center z-10 ${index === 0 ? 'bg-[#26aa99] shadow-md' : 'bg-gray-200'}`}>
                        {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                      </div>
                      <div className="flex flex-col">
                        <p className={`text-[12px] leading-snug ${index === 0 ? 'text-black font-bold' : 'text-gray-500'}`}>
                          {hist.notes}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(hist.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <OrderItemsDetail order={order} isFailed={isFailed} />
      </div>

      {/* MODAL PEMBATALAN */}
      <CancelOrderModal 
        isOpen={isCancelOpen} 
        onClose={() => setIsCancelOpen(false)} 
        order={order} 
        onSuccess={fetchOrder} 
      />
      <style jsx>{`
        .border-surel {
          border-image: repeating-linear-gradient(45deg, #ee4d2d, #ee4d2d 33px, transparent 33px, transparent 41px, #000000 41px, #000000 74px, transparent 74px, transparent 82px) 4;
        }
      `}</style>
    </div>
  );
}