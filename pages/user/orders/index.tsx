"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { 
  FiCopy, FiInfo, FiShoppingBag, 
  FiChevronRight, FiClock, FiRotateCcw 
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { formatRp, getCloudinaryImage } from "@/lib/utils";
import { OrderActionButton } from "@/components/order/OrderActionButton"; 
import TrackingModal from "@/components/order/TrackingModal";
import LoadingScreen from "@/components/ui/LoadingScreen";

// IMPORT MODAL BARU
import CancelOrderModal from "@/components/order/CancelOrderModal";
import ReturnOrderModal from "@/components/order/ReturnOrderModal";

const TABS = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Belum Bayar" },
  { id: "PAID", label: "Diproses" },
  { id: "SHIPPED", label: "Dikirim" },
  { id: "COMPLETED", label: "Selesai" },
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

  // STATE UNTUK MODAL TERPISAH
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

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

  useEffect(() => { fetchOrders(); }, [session]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return allTransactions;
    return allTransactions.filter((trx) => {
      if (activeTab === "CANCELLED") {
        return ["CANCELLED", "EXPIRED"].includes(trx.status) || !!trx.cancellationRequest;
      }
      if (activeTab === "PAID") {
        const isPaid = ["PAID", "SETTLEMENT", "PROCESSING", "READY_TO_SHIP"].includes(trx.status);
        return isPaid && !trx.cancellationRequest && !trx.refundRequest;
      }
      return trx.status === activeTab;
    });
  }, [activeTab, allTransactions]);

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
              <p className="text-gray-400  text-[10px] tracking-[0.2em]">Tidak ada pesanan</p>
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
                  
                  {/* HEADER STATUS */}
                  <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span 
                      className="text-[13px] text-gray-900 font-black flex items-center gap-1 cursor-pointer"
                      onClick={(e) => copyInvoice(e, trx.invoice)}
                    >
                      {trx.invoice} <FiCopy size={12} className="text-gray-300" />
                    </span>
                    
                    <div className="flex flex-col items-end text-[10px] font-semibold uppercase">
                      {isReqRetur ? (
                        <span className="text-orange-500 bg-orange-50 px-2 py-1 border border-orange-100">
                          Pengembalian Barang
                        </span>
                      ) : isReqBatal ? (
                        <span className="text-red-500 bg-red-50 px-2 py-1 border border-red-100 animate-pulse">
                          Menunggu Pembatalan
                        </span>
                      ) : isExpired ? (
                        <span className="text-gray-400">Dibatalkan</span>
                      ) : (
                        <span className="text-emerald-600">{trx.status}</span>
                      )}
                    </div>
                  </div>

                  {/* LINK CARD */}
                  <Link href={dest} className="block hover:bg-gray-50/40 transition-colors">
                    {trx.items?.slice(0, 1).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 px-2 pt-2">
                        <div className={`relative h-14 w-14 bg-gray-50 border border-gray-300 shrink-0 ${isExpired && !isReqBatal ? "grayscale" : ""}`}>
                          <Image src={getCloudinaryImage(item.product?.thumbnailUrl || "/placeholder.png", 200, 200)} alt="p" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] text-zinc-900 font-black truncate">{item.product?.name}</h4>
                          <p className="text-gray-500 text-[10px]">Varian: {item.variant?.name || "-"} </p>
                          <span className="text-black text-xs font-black ml-1">x{item.quantity}</span>
                        </div>
                        <div className="text-[12px] font-black text-zinc-600 mt-1">
                          {formatRp(item.priceAtBuy)} 
                        </div>
                        <FiChevronRight className="text-gray-200" />
                      </div>
                    ))}
                    {trx.items && trx.items.length > 1 && (
                      <div className="px-4 flex items-start justify-start border-t border-gray-50">
                        <p className="text-[10px] text-emerald-600 font-medium italic">
                          +{trx.items.length - 1} produk lainnya
                        </p>
                      </div>
                    )}
                  </Link>

                  {/* INFO BAR KHUSUS REQUEST */}
                  {isReqBatal && (
                    <div className="px-3 py-2 bg-red-50/30 border-t border-red-100 flex items-center gap-2">
                       <FiClock size={12} className="text-red-400" />
                       <p className="text-xs text-red-700 tracking-tight">Permintaan Pembatalan Dana Sedang Ditinjau</p>
                    </div>
                  )}
                  {isReqRetur && (
                    <div className="px-3 py-2 bg-orange-50/30 border-t border-orange-100 flex items-center gap-2">
                       <FiRotateCcw className="text-orange-400" size={12} />
                       <p className="text-xs text-orange-400 tracking-tight">Permintaan Pengembalian Barang Diajukan</p>
                    </div>
                  )}

                  {/* FOOTER ACTIONS */}
                  <div className="px-3 py-3 border-t border-dashed border-gray-100 flex flex-row justify-between gap-2 bg-slate-50/50">
                    <div className="flex flex-row grow justify-between items-center text-gray-400 text-[13px]">
                      <div className="flex flex-col md:flex-row md:gap-3 items-center justify-end">
                        <span className="text-gray-700 ">Total Pesanan</span>
                        <span className={`text-[18px] font-black tracking-tighter ${isExpired && !isReqBatal ? "text-gray-400" : "text-emerald-600"}`}>
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
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL CANCEL */}
      <CancelOrderModal 
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        order={selectedTrx}
        onSuccess={fetchOrders}
      />

      {/* MODAL RETURN */}
      <ReturnOrderModal 
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        order={selectedTrx}
        onSuccess={fetchOrders}
      />

      <TrackingModal 
        isOpen={isTrackingOpen} 
        onClose={() => setIsTrackingOpen(false)} 
        waybill={selectedTrx?.waybill} 
        invoice={selectedTrx?.invoice} 
      />
    </div>
  );
}