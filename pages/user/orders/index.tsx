"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { 
  FiCopy, FiShoppingBag, 
  FiClock, FiRotateCcw 
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { formatRp, getCloudinaryImage, displayStatus } from "@/lib/utils"; // Import displayStatus
import { OrderActionButton } from "@/components/order/OrderActionButton"; 
import TrackingModal from "@/components/order/TrackingModal";
import LoadingScreen from "@/components/ui/LoadingScreen";
import CancelOrderModal from "@/components/order/CancelOrderModal";
import ReturnOrderModal from "@/components/order/ReturnOrderModal";

const TABS = [
  { id: "ALL", label: "Semua" },
  { id: "UNPAID", label: "Belum Bayar" }, // Berubah dari PENDING
  { id: "PROCESSING", label: "Diproses" }, // Berubah dari PAID
  { id: "SHIPPED", label: "Dikirim" },
  { id: "DELIVERED", label: "Selesai" }, // Berubah dari COMPLETED
  { id: "CANCELLED", label: "Dibatalkan" }, 
];

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("ALL");
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  const fetchOrders = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/user/orders`); // Biarkan API yang handle semua data
      const data = await res.json();
      setAllTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Gagal memuat pesanan");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { fetchOrders(); }, [session]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return allTransactions;
    
    return allTransactions.filter((trx) => {
      // 1. Logika Tab Dibatalkan (Payment EXPIRED atau CANCELLED)
      if (activeTab === "CANCELLED") {
        return trx.status === "CANCELLED" || trx.status === "EXPIRED";
      }

      // 2. Logika Tab Belum Bayar
      if (activeTab === "UNPAID") {
        return trx.status === "PENDING";
      }

      // 3. Logika Tab Diproses (Sudah PAID, tapi barang belum dikirim)
      if (activeTab === "PROCESSING") {
        return trx.status === "PAID" && 
               ["PENDING", "PROCESSING", "READY_TO_SHIP"].includes(trx.shipment?.status);
      }

      // 4. Logika Tab Dikirim
      if (activeTab === "SHIPPED") {
        return trx.shipment?.status === "SHIPPED";
      }

      // 5. Logika Tab Selesai
      if (activeTab === "DELIVERED") {
        return trx.shipment?.status === "DELIVERED";
      }

      return false;
    });
  }, [activeTab, allTransactions]);

  // ... (copyInvoice, handlePayment tetap sama)
  const copyInvoice = (e: React.MouseEvent, inv: string) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(inv);
    toast.success("Invoice disalin");
  };

  const handlePayment = (e: React.MouseEvent, trx: any) => {
    e.preventDefault(); e.stopPropagation();
    router.push(`/payment/${trx.invoice}`);
  };

  const handleOpenTracking = (trx: any) => {
    setSelectedTrx(trx);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen pb-10 bg-gray-50/30">
      <div className="max-w-4xl mx-auto sm:px-2">
        {/* TABS UI */}
        <div className="md:mt-4 bg-white shadow-sm flex border-b border-gray-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] py-3 text-sm text-center transition-all border-b-2 ${
                activeTab === tab.id 
                  ? "border-b-4 border-zinc-950 text-zinc-950 font-black" 
                  : "border-transparent text-gray-400 "
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LIST TRANSAKSI */}
        <div className="mt-2 space-y-2">
          {loading ? (
            <LoadingScreen />
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white py-24 flex flex-col items-center justify-center text-center px-4 shadow-sm">
              <FiShoppingBag size={48} className="text-gray-100 mb-3" />
              <p className="text-gray-400 text-[10px] tracking-[0.2em]">Tidak ada pesanan</p>
            </div>
          ) : (
            filteredTransactions.map((trx) => {
              const isExpired = trx.status === "EXPIRED" || trx.status === "CANCELLED";
              const isReqBatal = !!trx.cancellationRequest; 
              const isReqRetur = !!trx.refundRequest; 

              let dest = `/user/orders/${trx.invoice}`;
              if (isReqRetur) dest = `/user/orders/refund/${trx.invoice}`;
              else if (isReqBatal) dest = `/user/orders/cancellation/${trx.invoice}`;
              
              return (
                <div key={trx.id} className={`bg-white shadow-sm border border-gray-100 ${isExpired && !isReqBatal ? "opacity-60" : ""}`}>
                  
                  {/* HEADER STATUS - MENGGUNAKAN HELPER displayStatus */}
                  <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span 
                      className="text-[13px] text-gray-900 font-black flex items-center gap-1 cursor-pointer"
                      onClick={(e) => copyInvoice(e, trx.invoice)}
                    >
                      {trx.invoice} <FiCopy size={12} className="text-gray-300" />
                    </span>
                    
                    <div className="flex flex-col items-end text-[10px] font-bold uppercase tracking-wider">
                       <span className={isExpired ? "text-gray-400" : "text-emerald-600"}>
                          {displayStatus(trx.status, trx.shipment?.status)}
                       </span>
                    </div>
                  </div>

                  {/* CONTENT (Image & Detail) */}
                  <Link href={dest} className="block hover:bg-gray-50/40 transition-colors py-3">
                    {trx.items?.slice(0, 1).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 px-3">
                        <div className={`relative h-16 w-16 bg-gray-50 border border-gray-200 shrink-0 ${isExpired && !isReqBatal ? "grayscale" : ""}`}>
                          <Image src={getCloudinaryImage(item.product?.thumbnailUrl || "/placeholder.png", 200, 200)} alt="p" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] text-zinc-900 font-black truncate">{item.product?.name}</h4>
                          <p className="text-gray-500 text-[10px]">Varian: {item.variant?.name || "-"} </p>
                          <span className="text-black text-xs font-black">x{item.quantity}</span>
                        </div>
                        <div className="text-[12px] font-black text-zinc-600">
                          {formatRp(item.priceAtBuy)} 
                        </div>
                      </div>
                    ))}
                  </Link>

                  {/* FOOTER ACTIONS */}
                  <div className="px-3 py-3 border-t border-dashed border-gray-100 flex flex-row justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-500 text-[11px] uppercase tracking-tighter">Total</span>
                       <span className={`text-[16px] font-black ${isExpired ? "text-gray-400" : "text-zinc-900"}`}>
                         {formatRp(trx.totalAmount)}
                       </span>
                    </div>

                    <OrderActionButton 
                      trx={trx} 
                      handlePayment={handlePayment} 
                      onOpenTracking={handleOpenTracking}
                      onCancel={() => { setSelectedTrx(trx); setIsCancelOpen(true); }} 
                      onReturn={() => { setSelectedTrx(trx); setIsReturnOpen(true); }} 
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODALS */}
      <CancelOrderModal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} order={selectedTrx} onSuccess={fetchOrders} />
      <ReturnOrderModal isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} order={selectedTrx} onSuccess={fetchOrders} />
      <TrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} waybill={selectedTrx?.shipment?.awbNumber} invoice={selectedTrx?.invoice} />
    </div>
  );
}