"use client";

import { useRouter } from "next/router";

interface ActionButtonProps {
  trx: any;
  handlePayment: (e: React.MouseEvent, trx: any) => void;
  onOpenTracking: (trx: any) => void;
  onCancel: (trx: any) => void; // Menangani Pembatalan (Tipe 1 & 2)
  onReturn: (trx: any) => void; // Menangani Pengembalian Barang (Retur)
}

export const OrderActionButton = ({ 
  trx, 
  handlePayment, 
  onOpenTracking, 
  onCancel, 
  onReturn 
}: ActionButtonProps) => {
  const router = useRouter();

  // Deteksi adanya request di database
  const hasCancelReq = !!trx.cancellationRequest;
  const hasReturnReq = !!trx.refundRequest;

  const getButtons = () => {
    const buttons = [];

    switch (trx.status) {
      case "PENDING":
        // BELUM BAYAR: Pembatalan Tipe 1
        buttons.push({ 
          label: "Batalkan", 
          className: "bg-zinc-900 text-zinc-400 border-zinc-100", 
          onClick: () => onCancel(trx) 
        });
        buttons.push({ 
          label: "Bayar Sekarang", 
          className: "bg-[#ee4d2d] text-white border-none shadow-sm", 
          onClick: (e: any) => handlePayment(e, trx) 
        });
        break;

      case "PAID":
      case "PROCESSING":
      case "READY_TO_SHIP":
        // SUDAH BAYAR: Pembatalan Tipe 2 (Kembali Dana)
        if (hasCancelReq) {
          buttons.push({ 
            label: "Tinjau Pembatalan", 
            className: "bg-red-50 text-red-600 border-red-100", 
            onClick: () => router.push(`/user/orders/cancellation/${trx.invoice}`) 
          });
        } else {
          buttons.push({ 
            label: "Ajukan Pembatalan", 
            className: "bg-zinc-900 text-zinc-400 border-zinc-100", 
            onClick: () => onCancel(trx) 
          });
        }

        if (trx.status === "READY_TO_SHIP") {
          buttons.push({ 
            label: "Lacak", 
            className: "bg-zinc-900 text-white border-none", 
            onClick: () => onOpenTracking(trx) 
          });
        }
        break;

      case "SHIPPED":
        // BARANG JALAN: Bisa Lacak & Bisa Retur
        buttons.push({ 
          label: "Lacak", 
          className: "bg-zinc-900 text-white border-none", 
          onClick: () => onOpenTracking(trx) 
        });
        break;

      case "COMPLETED":
        if (hasReturnReq) {
          buttons.push({ 
            label: "Tinjau Pengembalian Baarang", 
            className: "bg-orange-50 text-orange-600 border-orange-200", 
            onClick: () => router.push(`/user/orders/refund/${trx.invoice}`) 
          });
        } else {
          buttons.push({ 
            label: "Return Barang", 
            className: "text-orange-500 border-orange-100", 
            onClick: () => onReturn(trx) 
          });
        }
        buttons.push({ 
          label: "Beli Lagi", 
          className: "bg-zinc-900 text-white border-none", 
          onClick: () => router.push(`/our-products`) 
        });
        break;

      case "CANCELLED":
      case "EXPIRED":
        // SUDAH BATAL
        buttons.push({ 
          label: "Detail Pembatalan", 
          className: "text-zinc-500 border-zinc-200", 
          onClick: () => router.push(`/user/orders/cancellation/${trx.invoice}`) 
        });
        buttons.push({ 
          label: "Beli Lagi", 
          className: "bg-zinc-900 text-white border-none", 
          onClick: () => router.push(`/our-products`) 
        });
        break;
    }

    return buttons;
  };

  const buttons = getButtons();

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.onClick();
          }}
          className={`
            px-4 py-2 text-[10px] font-black uppercase tracking-widest 
            border transition-all duration-200 rounded-none 
            flex items-center justify-center min-w-[100px]
            ${btn.className}
          `}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};