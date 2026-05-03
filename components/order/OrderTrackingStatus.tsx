import { FiShoppingBag, FiTruck, FiAlertCircle, FiRotateCcw, FiChevronRight } from "react-icons/fi";

export const OrderTrackingStatus = ({ trx, onOpenTracking }: { trx: any; onOpenTracking: (trx: any) => void }) => {
  const shipmentStatus = trx.shipment?.status;
  const cancelReq = trx.cancellationRequest;
  const refundReq = trx.refundRequest;

  // 1. Prioritas Utama: Status Pembatalan/Refund jika ada pengajuan aktif
  if (cancelReq) {
    return (
      <div className="bg-orange-50 rounded-2xl py-2 px-3 mb-3 flex items-start gap-2 border border-orange-100">
        <FiAlertCircle size={18} className="text-orange-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-[13px] font-black text-orange-950">Update Pembatalan</p>
          <p className="text-[12px] text-orange-800 leading-snug">
            {cancelReq.status === 'PENDING' && "Permintaan pembatalan Anda sedang diproses oleh admin."}
            {cancelReq.status === 'REJECTED' && "Permintaan pembatalan ditolak. Silakan hubungi Customer Service."}
            {cancelReq.status === 'APPROVED' && "Pesanan berhasil dibatalkan. Dana akan dikembalikan."}
          </p>
        </div>
      </div>
    );
  }

  if (refundReq) {
    return (
      <div className="bg-blue-50 rounded-2xl py-2 px-3 mb-3 flex items-start gap-2 border border-blue-100">
        <FiRotateCcw size={18} className="text-blue-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-[13px] font-black text-blue-950">Update Pengembalian</p>
          <p className="text-[12px] text-blue-800 leading-snug">
             Status: <span className="font-bold">{refundReq.status}</span>. Cek detail untuk info pengiriman balik barang.
          </p>
        </div>
      </div>
    );
  }

  const showTracking = ["READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(shipmentStatus);

  if (showTracking) {
    const getTrackingInfo = () => {
      switch (shipmentStatus) {
        case "READY_TO_SHIP":
          return {
            title: "Package is ready",
            desc: "Penjual telah menyiapkan paket dan menunggu kurir menjemput.",
            icon: <FiShoppingBag size={18} className="text-zinc-600" />
          };
        case "SHIPPED":
          return {
            title: "In Transit",
            desc: `Paket sedang dikirim oleh kurir [${trx.shipment.courierCode.toUpperCase()}]. Klik untuk lacak.`,
            icon: <FiTruck size={18} className="text-zinc-600" />
          };
        case "DELIVERED":
          return {
            title: "Package Delivered",
            desc: "Paket telah diterima. Jangan lupa berikan ulasan terbaik Anda.",
            icon: <FiTruck size={18} className="text-emerald-600" />
          };
        default:
          return null;
      }
    };

    const info = getTrackingInfo();
    if (!info) return null;

    return (
      <div 
        onClick={() => onOpenTracking(trx)}
        className="bg-gray-50 rounded-2xl py-2 px-3 mb-3 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors group"
      >
        <div className="flex-1">
            <div className="flex flex-row gap-2">
                <div className="mt-0.5">{info.icon}</div>
                <div className="flex flex-col items-start mb-1">
                    <span className="text-[13px] font-black text-black">{info.title}</span>
                    <p className="text-[12px] text-gray-500 leading-snug">
                    {info.desc}
                    </p>
                </div>
            </div>
        </div>
        <FiChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
      </div>
    );
  }

  if (trx.status === "PENDING") {
    return (
      <div className="bg-zinc-50 rounded-2xl py-2 px-3 mb-3 flex items-start gap-2 border border-zinc-100">
        <FiAlertCircle size={18} className="text-zinc-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-[13px] font-black text-black">Awaiting Payment</p>
          <p className="text-[12px] text-gray-500 leading-snug">
            Selesaikan pembayaran sebelum batas waktu berakhir agar pesanan segera diproses.
          </p>
        </div>
      </div>
    );
  }

  return null;
};