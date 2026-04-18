"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  FiChevronLeft, FiTruck, 
  FiCreditCard, FiInfo, FiCheck 
} from "react-icons/fi";
import { 
  FaFileInvoiceDollar, FaBox,
  FaStickyNote
} from "react-icons/fa";
import Image from "next/image";
import { toast } from "sonner";
import { formatRp, getCloudinaryImage } from "@/lib/utils";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;

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

    fetchOrder();
  }, [id, router.isReady]);

  if (loading) return (
    <LoadingScreen />
  );

  if (!order) return <div className="h-screen flex items-center justify-center font-bold text-gray-600 uppercase tracking-widest">TRANSACTION NOT FOUND</div>;

  const isFailed = order.status === "EXPIRED" || order.status === "CANCELLED";

  // LOGIKA STATUS UNTUK STEPPER
  const steps = [
    { label: "Pesanan Dibuat", icon: <FaFileInvoiceDollar />, status: "PENDING", active: true },
    { label: "Pesanan Dibayar", icon: <FiCreditCard />, status: "PAID", active: !["PENDING"].includes(order.status) && !isFailed },
    { label: "Pesanan Dikirim", icon: <FiTruck />, status: "SHIPPED", active: ["SHIPPED", "COMPLETED"].includes(order.status) },
    { label: "Pesanan Selesai", icon: <FaBox />, status: "COMPLETED", active: order.status === "COMPLETED" },
  ];

  // Hitung persentase bar progres
  const activeCount = steps.filter(s => s.active).length;
  const progressWidth = ((activeCount - 1) / (steps.length - 1)) * 100;

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
        
        {/* STEPPER STATUS (GAYA SHOPEE ENHANCED) */}
        <div className="bg-white p-6 md:p-10 flex justify-between relative overflow-hidden">
          {/* Garis Dasar (Abu) */}
          <div className="absolute top-[44px] md:top-[75px] left-[12%] right-[12%] h-[4px] bg-gray-100 rounded-full" />
          {/* Garis Progres (Hijau) */}
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
              {/* Info Waktu Singkat di bawah Stepper jika ada */}
              {order.history?.find((h: any) => h.status === step.status || (step.status === "PAID" && h.status === "SETTLEMENT")) && (
                <p className="text-[9px] text-gray-600 mt-1 hidden md:block">
                  {new Date(order.history.find((h: any) => h.status === step.status || (step.status === "PAID" && h.status === "SETTLEMENT")).createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* NOTIFIKASI STATUS TERAKHIR */}
        <div className="bg-[#fffdf4] p-4 px-6 border-b border-[#f8ebad] flex items-center gap-3">
            <FiInfo className="text-[#ee4d2d]" size={18} />
            <p className="text-[13px] text-gray-700">
                {order.status === "PENDING" && "Mohon segera selesaikan pembayaran Anda sebelum waktu habis."}
                {order.status === "PAID" && "Pembayaran terverifikasi. Kami sedang memproses pesanan Anda."}
                {order.status === "SHIPPED" && "Pesanan Anda sedang dalam perjalanan oleh kurir."}
                {order.status === "COMPLETED" && "Pesanan telah diterima. Terima kasih telah berbelanja!"}
                {isFailed && "Pesanan ini telah dibatalkan atau waktu pembayaran telah habis."}
            </p>
        </div>

        {/* INFORMASI PENGIRIMAN & LOG PENGIRIMAN */}
        <div className="bg-white p-6 shadow-sm border-t-4 border-surel">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
               <h3 className="text-[14px] font-bold text-black mb-4 uppercase tracking-widest flex items-center gap-2">
                 <FiTruck className="text-[#26aa99]" /> Alamat Pengiriman
               </h3>
               <p className="font-bold text-gray-800 text-[13px] uppercase">{order.recipientName || order.user?.name}</p>
               <p className="text-gray-500 text-[12px] mb-2">{order.recipientPhone || order.user?.phoneNumber}</p>
               <p className="text-gray-600 text-[12px] leading-relaxed uppercase">
                {order.shippingAddress}
               </p>
            </div>
            
            {/* RIWAYAT STATUS DETAIL */}
            <div className="md:w-[45%] md:border-l border-gray-100 md:pl-8">
               <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4 flex justify-between">
                 <span>Riwayat Status</span>
                 <button className="text-[#26aa99] lowercase font-normal">Lihat Detail</button>
               </p>
               <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                  {order.history?.map((hist: any, index: number) => (
                    <div key={hist.id} className={`relative pl-7 ${index !== 0 ? 'opacity-60' : ''}`}>
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center z-10 ${index === 0 ? 'bg-[#26aa99] shadow-md' : 'bg-gray-200'}`}>
                        {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                      </div>
                      <div>
                        <p className={`text-[12px] font-bold uppercase ${index === 0 ? 'text-[#26aa99]' : 'text-gray-600'}`}>{hist.status}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{hist.notes || `Status pesanan berubah menjadi ${hist.status}`}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{new Date(hist.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* RINCIAN PRODUK (TETAP SAMA) */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            <div className="flex p-4 gap-2 items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FaFileInvoiceDollar className="text-gray-600" />
                <span className="text-sm">ID Pesanan :  {order.invoice}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${isFailed ? "bg-red-100 text-red-400" : "bg-emerald-600 text-white"}`}>
                {order.status}
              </span>
            </div>
            {order.items?.map((item: any) => (
              <div key={item.id} className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 relative bg-gray-50 border border-gray-100 shrink-0">
                  <Image src={getCloudinaryImage(item.product?.thumbnailUrl || "/placeholder.png", 200, 200)} alt="p" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black text-[15px] truncate">{item.product?.name}</p>
                  <p className="text-gray-600 text-[11px] mt-1 ">Variasi: {item.variant?.name || "-"}</p>
                  <p className="text-gray-800 text-[12px] mt-1 font-medium">x{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-bold text-[14px] tabular-nums">{formatRp(item.priceAtBuy)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTALAN */}
          <div className="border-t border-gray-100 bg-[#fafafa] p-4">
            <table className="w-full text-[12px] border-separate border-spacing-y-2">
              <tbody className="text-gray-500 space-y-2">
                {/* Subtotal */}
                <tr>
                  <td className="text-right">Subtotal Produk</td>
                  <td className="text-right text-gray-800 w-[120px]">
                    {formatRp(order.subtotal)}
                  </td>
                </tr>

                {/* Ongkir */}
                <tr>
                  <td className="text-right">Total Ongkos Kirim</td>
                  <td className="text-right text-gray-800">
                    {formatRp(order.shippingCost)}
                  </td>
                </tr>

                {/* Kondisional: Diskon */}
                {order.discount > 0 && (
                  <tr>
                    <td className="text-right">Voucher Diskon</td>
                    <td className="text-right text-red-500">
                      -{formatRp(order.discount)}
                    </td>
                  </tr>
                )}
               {/* Kondisional: Diskon */}
                {order.insuranceCost > 0 && (
                  <tr>
                    <td className="text-right">Asuransi</td>
                    <td className="text-right text-red-500">
                      -{formatRp(order.insuranceCost)}
                    </td>
                  </tr>
                )}
                {/* Kondisional: Service Fee */}
                {order.serviceFee > 0 && (
                  <tr>
                    <td className="text-right">Service Fee</td>
                    <td className="text-right text-gray-800">
                      {formatRp(order.serviceFee)}
                    </td>
                  </tr>
                )}

                {/* Total Pesanan (Footer Tabel) */}
                <tr>
                  <td colSpan={2} className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-gray-900 font-bold uppercase text-[13px] tracking-widest">
                        Total Pesanan
                      </span>
                      <span className="text-[24px] font-black text-[#ee4d2d] tracking-tighter leading-none">
                        {formatRp(order.totalAmount)}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR */}
      <div className=" bg-white border-t border-gray-100 p-4 z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
          {order.status === "PENDING" && (
            <button onClick={() => router.push(`/payment/${order.invoice}`)} className="px-8 py-2.5 bg-[#ee4d2d] text-white rounded-none font-black uppercase text-[11px] shadow-sm hover:brightness-110 transition-all">
               Bayar Sekarang
            </button>
          )}
          <button onClick={() => router.push('/out-products')} className="px-6 py-2.5 bg-zinc-900 text-white rounded-none font-bold uppercase text-[11px] hover:bg-black transition-all">
             Beli Lagi
          </button>
        </div>
      </div>

      <style jsx>{`
        .border-surel {
          border-image: repeating-linear-gradient(45deg, #ee4d2d, #ee4d2d 33px, transparent 33px, transparent 41px, #000000 41px, #000000 74px, transparent 74px, transparent 82px) 4;
        }
      `}</style>
    </div>
  );
}