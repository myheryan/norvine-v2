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
import OrderTracking from "@/components/order/OrderTracking";

export default function OrderDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [lionHistory, setLionHistory] = useState<any[]>([]);

  // 1. Fungsi Fetch Data Utama
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

  // 2. Effect untuk Load Order
  useEffect(() => {
    if (!router.isReady || !id || !session) return;
    fetchOrder();
  }, [id, router.isReady, session]);

  // 3. Effect untuk Tracking Lion Parcel
  useEffect(() => {
    if (!order) return;

    const currentStatus = order.shipment?.status;
    const isReadyToTrack = ["READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(currentStatus);
    
    if (!isReadyToTrack) return;

    const stt = order.shipment?.awbNumber;
    if (!stt) return;

    const controller = new AbortController();

    fetch(`/api/shipping/lionApiTrack/${stt}`, { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        if (result.stts && result.stts.length > 0) {
          const sttInfo = result.stts[0];
          const historyData = sttInfo?.history || []; 

          const mappedHistory = historyData.map((item: any) => ({
            id: `${item.status_code}-${item.datetime}`, 
            notes: item.remarks || "No description available", 
            createdAt: item.datetime, 
            location: item.city || item.location || "",
            attachment: item.attachment || []
          }));
          
          setLionHistory(mappedHistory);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error("Tracking error:", err);
      });

    return () => controller.abort();
  }, [order]);

  // --- EARLY RETURN: JANGAN letakkan logika variabel order di atas sini ---
  if (loading) return <LoadingScreen />;
  if (!order) return <div className="h-screen flex items-center justify-center">TRANSACTION NOT FOUND</div>;

  // --- LOGIKA VARIABEL (Aman karena order sudah dipastikan ada) ---
  const isFailed = order.status === "EXPIRED" || order.status === "CANCELLED";
  const isPaid = order.status === "PAID";
  const shipment = order.shipment;
  const isCancellationRequested = !!order.cancellationRequest;
  const isRefunding = !!order.refundRequest;

  const combinedHistory = [
    ...(lionHistory || []), 
    ...(order.history || []) 
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const steps = (() => {
    if (isCancellationRequested) {
      return [
        { label: "Diajukan", icon: <FaStickyNote size={20}/>, active: true },
        { label: "Ditinjau", icon: <FiClock size={20}/>, active: ["PENDING", "APPROVED"].includes(order.cancellationRequest?.status) },
        { label: "Selesai", icon: <FiCheck size={20}/>, active: order.cancellationRequest?.status === "REFUNDED" },
      ];
    }
    if (isFailed) {
      return [
        { label: "Pesanan dibuat", icon: <FaFileInvoiceDollar size={20} />, active: true },
        { label: "Pesanan dibatalkan", icon: <FiX />, active: true },
      ];
    }
    return [
      { label: "Dibuat", icon: <FaFileInvoiceDollar size={20}/>, active: true },
      { label: "Dibayar", icon: <FiCreditCard size={20} />, active: isPaid || order.status === "REFUNDED" },
      { label: "Diproses", icon: <FiPackage size={20}/>, active: shipment && ["READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(shipment?.status) },
      { label: "Dikirim", icon: <FiTruck size={20}/>, active: isPaid && ["SHIPPED", "DELIVERED"].includes(shipment?.status) },
      { label: "Selesai", icon: <FaBox size={20}/>, active: shipment?.status === "DELIVERED" },
    ];
  })();

  const activeCount = steps.filter(s => s.active).length;
  const progressWidth = steps.length > 1 ? ((activeCount - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen md:pt-3 bg-gray-50/50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-black font-medium">
            <FiChevronLeft size={18} /> Kembali
          </button>
          <span className="text-black font-semibold">Detail Pesanan</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-0.5 space-y-0.5">
        {/* STEPPER */}
        <div className="bg-white p-6 md:p-10 flex justify-between relative overflow-hidden">
          <div className="absolute top-[44px] md:top-[70px] left-[12%] right-[12%] h-[3px] md:h-[4px] bg-gray-100 rounded-full" />
          <div 
            className="absolute top-[44px] md:top-[70px] left-[12%] h-[3px] md:h-[4px] bg-black transition-all duration-700 rounded-full" 
            style={{ width: `${progressWidth * 0.76}%` }} 
          />
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center flex-1 text-center">
              <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[2px] border-black shadow-sm transition-all duration-500 ${step.active ? 'bg-zinc-900 text-white' : 'bg-white text-gray-300 border-gray-100'}`}>
                {step.active && i < activeCount - 1 && !isFailed ?  step.icon :  step.icon}
              </div>
              <p className={`mt-3 font-bold text-[10px] md:text-[12px] ${step.active ? 'text-black' : 'text-gray-300'}`}>{step.label}</p>
            </div>
          ))}
        </div> 

        {/* ALERT STATUS */}
        <div className="bg-[#fffdf4] p-2 border-b border-[#f8ebad] flex flex-col md:flex-row">
          <div className="flex items-start gap-2 grow">
            <FiInfo className="text-[#ee4d2d]" size={18} />
            <p className="text-[13px] text-zinc-700">
              {isCancellationRequested 
                ? `Permintaan Pembatalan: ${order.cancellationRequest.status === 'PENDING' ? 'Sedang ditinjau' : order.cancellationRequest.status}`
                : isRefunding 
                ? `Status Refund: ${order.refundRequest.status}`
                : displayStatus(order.status, shipment?.status)}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 w-full md:w-auto">
            {order.status === "PENDING" && (
              <button onClick={() => router.push(`/payment/${order.invoice}`)} className="bg-[#ee4d2d] text-white px-8 py-2.5 font-black uppercase text-[11px]">
                Bayar Sekarang
              </button>
            )}
            {isPaid && (shipment?.status === "PENDING" || shipment?.status === "PROCESSING") && !isCancellationRequested && (
              <button onClick={() => setIsCancelOpen(true)} className="px-6 py-2.5 border border-zinc-200 text-zinc-500 font-black uppercase text-[11px]">
                Ajukan Pembatalan
              </button>
            )}
          </div>
        </div>

        {/* INFO PENGIRIMAN */}
        <div className="bg-white p-3 border-t-4 border-surel">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <h3 className="text-[14px] font-bold mb-3 flex items-center gap-2">
                <FiTruck className="text-[#26aa99]" /> Alamat Pengiriman
              </h3>
              <p className="font-bold text-[13px]">{order.shippingAddress?.recipientName}</p>
              <p className="text-gray-500 text-[12px]">{formatPhoneNumber(order.shippingAddress?.recipientPhone)}</p>
              <p className="text-gray-600 text-[12px] leading-relaxed">
                {order.shippingAddress?.fullAddress} <br />
                {order.shippingAddress?.district}, {order.shippingAddress?.city}, {order.shippingAddress?.province}
              </p>
            </div>
            <OrderTracking history={combinedHistory} awbNumber={shipment?.awbNumber} />
          </div>
        </div>

        <OrderItemsDetail order={order} isFailed={isFailed} />
      </div>

      <CancelOrderModal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} order={order} onSuccess={fetchOrder} />
      
      <style jsx>{`
        .border-surel {
          border-image: repeating-linear-gradient(45deg, #ee4d2d, #ee4d2d 33px, transparent 33px, transparent 41px, #000000 41px, #000000 74px, transparent 74px, transparent 82px) 4;
        }
      `}</style>
    </div>
  );
}