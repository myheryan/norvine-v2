"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FiCopy, FiShoppingBag} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { formatIDR, getCloudinaryImage, displayStatus } from "@/lib/utils";
import { OrderActionButton } from "@/components/order/OrderActionButton"; 
import TrackingModal from "@/components/order/TrackingModal";
import LoadingScreen from "@/components/ui/LoadingScreen";
import CancelOrderModal from "@/components/order/CancelOrderModal";
import ReturnOrderModal from "@/components/order/ReturnOrderModal";
import { OrderTrackingStatus } from "@/components/order/OrderTrackingStatus";
import clsx from "clsx";

const TABS = [
  { id: "ALL", label: "Semua" },
  { id: "UNPAID", label: "Belum Bayar" },
  { id: "READY_TO_SHIP", label: "Diproses" },
  { id: "SHIPPED", label: "Dikirim" },
  { id: "DELIVERED", label: "Selesai" },
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
      const res = await fetch(`/api/user/orders`); 
      const data = await res.json();
      setAllTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Gagal memuat pesanan");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    if (session) fetchOrders();
  }, [session]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return allTransactions;
    return allTransactions.filter((trx) => {
      if (activeTab === "CANCELLED") {
        return trx.status === "CANCELLED" || trx.status === "EXPIRED";
      }
      if (activeTab === "UNPAID") {
        return trx.status === "PENDING";
      }
      if (activeTab === "PROCESSING") {
        return trx.status === "PAID" && 
               ["PENDING", "READY_TO_SHIP"].includes(trx.shipment?.status);
      }
      if (activeTab === "SHIPPED") {
        return trx.shipment?.status === "SHIPPED";
      }
      if (activeTab === "DELIVERED") {
        return trx.shipment?.status === "DELIVERED";
      }
      return false;
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

// Di dalam UserOrdersPage.tsx

const handleWithdrawCancel = async (trx: any) => {
  // Gunakan loading state jika perlu agar tidak double click
  const confirmWithdraw = window.confirm(
    "Apakah Anda yakin ingin membatalkan pengajuan pembatalan untuk pesanan ini?"
  );

  if (!confirmWithdraw) return;

  try {
    const res = await fetch(`/api/user/orders/cancellation/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: trx.id }),
    });
    const result = await res.json();
    if (res.ok) {
      toast.success("Pengajuan pembatalan berhasil ditarik");
      fetchOrders(); 
    } else {
      toast.error(result.message || "Gagal menarik pengajuan");
    }
  } catch (error) {
    console.error("Error withdrawing request:", error);
    toast.error("Terjadi kesalahan sistem");
  }
};


  return (
    <div className="min-h-screen pb-10 bg-gray-50/30">
      <div className="max-w-4xl mx-auto sm:px-2">
        {/* TABS UI */}
        <div className="md:mt-4 bg-white shadow-sm flex border-b border-gray-100 overflow-x-auto no-scrollbar sticky top-0 z-20">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] py-3 text-sm text-center transition-all border-b-2 ${
                activeTab === tab.id 
                  ? "border-b-4 border-zinc-950 text-zinc-950 font-black" 
                  : "border-transparent text-gray-700 "
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
              <p className="text-gray-700 text-[10px] tracking-[0.2em]">Tidak ada pesanan</p>
            </div>
          ) : (
            filteredTransactions.map((trx) => {

              const firstItem = trx.items?.[0];

              return (
                <div key={trx.id} className="bg-white px-4 py-5 border-b border-gray-100 last:border-0 transition-all">
                  
                  {/* 1. HEADER: INVOICE & STATUS */}
                  <div className={clsx("flex justify-between items-start mb-4","text-[13px] font-semibold text-black")}>
                    <span> {trx.invoice} </span>
                    <span> { displayStatus(trx) }</span>
                  </div>

                  <OrderTrackingStatus trx={trx} onOpenTracking={handleOpenTracking} />

                  {/* 3. PRODUCT DETAIL */}
                  <Link href={`/user/orders/${trx.invoice}`} className="flex gap-4 group">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <Image 
                        src={getCloudinaryImage(firstItem?.product?.thumbnailUrl || "/placeholder.png", 200, 200)} 
                        alt="product" 
                        fill 
                        className="object-cover"
                      />
                      
                    </div>
                    <div className="flex-1 flex flex-col justify-start">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[13px] font-medium text-gray-800 line-clamp-2 leading-tight">
                          {firstItem?.product?.name}
                        </h4>
                        <span className="text-[13px] font-medium text-black shrink-0">
                          {formatIDR(firstItem?.priceAtBuy)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <p className="text-[12px] text-gray-700">
                          {firstItem?.variant?.name || "-"}
                        </p>
                        <span className="text-[12px] font-medium">
                          x{firstItem?.quantity}
                        </span>
                      </div>
                      {trx.items && trx.items.length > 1 && (
                      <div className="mt-1">
                        <p className="text-[10px] text-emerald-600 font-bold italic">
                          +{trx.items.length - 1} produk lainnya
                        </p>
                      </div>
                    )}
                    </div>
                  </Link>

                  {/* 4. TOTAL AMOUNT */}
                  <div className="flex justify-end items-center mb-2">
                    <div className="text-right">
                        <span className="text-[13px] text-gray-500 mr-2">Total:</span>
                        <span className="text-[14px] font-black text-black">
                          {formatIDR(trx.totalAmount)}
                        </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <OrderActionButton 
                      trx={trx} 
                      handlePayment={handlePayment} 
                      onOpenTracking={handleOpenTracking}
                      onCancel={() => { setSelectedTrx(trx); setIsCancelOpen(true); }} 
                      onReturn={() => { setSelectedTrx(trx); setIsReturnOpen(true); }}
                      onWithdrawCancel={handleWithdrawCancel}
                   />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODALS */}
      <CancelOrderModal 
        isOpen={isCancelOpen} 
        onClose={() => setIsCancelOpen(false)} 
        order={selectedTrx} 
        onSuccess={fetchOrders} 
      />
      <ReturnOrderModal 
        isOpen={isReturnOpen} 
        onClose={() => setIsReturnOpen(false)} 
        order={selectedTrx} 
        onSuccess={fetchOrders} 
      />
      <TrackingModal 
        isOpen={isTrackingOpen} 
        onClose={() => setIsTrackingOpen(false)} 
        waybill={selectedTrx?.shipment?.awbNumber} 
        invoice={selectedTrx?.invoice} 
      />
    </div>
  );
}