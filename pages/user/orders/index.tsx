"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FiCopy, FiInfo, FiShoppingBag, FiAlertCircle } from "react-icons/fi";
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

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State Utama
  const [activeTab, setActiveTab] = useState("ALL");
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal Lacak
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);

  // 1. FETCH SEKALI SAJA (AMBIL SEMUA DATA)
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session) return;
      try {
        // Memanggil API dengan status ALL agar semua data tersimpan di memori client
        const res = await fetch(`/api/user/orders?status=ALL`);
        const data = await res.json();
        setAllTransactions(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error("Gagal memuat pesanan");
      } finally {
        // Memberikan sedikit delay agar transisi loading lebih smooth
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchOrders();
  }, [session]);

  // 2. FILTER DATA DI CLIENT (INSTAN TANPA FETCH ULANG)
  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return allTransactions;
    
    // Logika filter: Sesuaikan jika status PAID di DB-mu punya alias (SETTLEMENT/CAPTURE)
    return allTransactions.filter((trx) => {
      if (activeTab === "PAID") {
        return ["PAID", "SETTLEMENT", "CAPTURE"].includes(trx.status);
      }
      return trx.status === activeTab;
    });
  }, [activeTab, allTransactions]);

  const handleOpenTracking = (trx: any) => {
    setSelectedTrx(trx);
    setIsTrackingOpen(true);
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

  return (
    <div className="min-h-screen pb-10 bg-gray-50/30">
      <div className="max-w-4xl mx-auto sm:px-2">
        
        {/* Tab Nav - Sekarang Berpindah Secara Instan */}
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
                  
                  {/* Header Card */}
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

                  {/* Items Container */}
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

                  {/* Footer Card */}
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
                      />
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Lacak (Di luar loop agar performa lebih ringan) */}
      <TrackingModal 
        isOpen={isTrackingOpen} 
        onClose={() => setIsTrackingOpen(false)} 
        waybill={selectedTrx?.waybill} 
        invoice={selectedTrx?.invoice}
      />
    </div>
  );
}