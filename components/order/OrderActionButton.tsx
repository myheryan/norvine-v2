"use client";

import { useRouter } from "next/router";

interface ActionButtonProps {
  trx: any;
  handlePayment: (e: React.MouseEvent, trx: any) => void;
  onOpenTracking: (trx: any) => void;
  onCancel: (trx: any) => void; 
  onWithdrawCancel?: (trx: any) => void;
  onReturn: (trx: any) => void; 
}

export const OrderActionButton = ({ 
  trx, 
  handlePayment, 
  onOpenTracking, 
  onCancel,
  onWithdrawCancel,
  onReturn 
}: ActionButtonProps) => {
  const router = useRouter();

  const hasCancelReq = !!trx.cancellationRequest;
  const cancelStatus = trx.cancellationRequest?.status;
  const hasReturnReq = !!trx.refundRequest;
  const shipStatus = trx.shipment?.status; 

const getButtons = () => {
    const buttons = [];

    // 1. Definisikan kondisi pengiriman
    const isTransit = shipStatus === "SHIPPED";
    const isReady = shipStatus === "READY_TO_SHIP";
    const isDelivered = shipStatus === "DELIVERED";

    switch (trx.status) {
      case "PENDING":
        buttons.push({ 
          label: "Cancel order", 
          className: "border-zinc-200 text-zinc-500 hover:bg-zinc-50", 
          onClick: () => onCancel(trx) 
        });
        buttons.push({ 
          label: "Pay now", 
          className: "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800", 
          onClick: (e: any) => handlePayment(e, trx) 
        });
        break;

      case "PAID":
      case "PROCESSING":
        // --- LOGIKA PRIORITAS: PEMBATALAN ---
        // Jika ada request pembatalan (Pending atau Rejected), tampilkan tombol terkait dulu
        if (hasCancelReq) {
          if (cancelStatus === 'PENDING') {
            buttons.push({ 
              label: "Withdraw request", 
              className: "border-zinc-200 text-zinc-900 hover:bg-zinc-50", 
              onClick: () => onWithdrawCancel && onWithdrawCancel(trx) 
            });
            buttons.push({ 
              label: "View cancellation", 
              className: "border-orange-100 text-orange-600 bg-orange-50/50", 
              onClick: () => router.push(`/user/orders/cancellation/${trx.invoice}`) 
            });
          } 
          else if (cancelStatus === 'REJECTED') {
            buttons.push({ 
              label: "View details", 
              className: "border-zinc-200 text-zinc-500", 
              onClick: () => router.push(`/user/orders/cancellation/${trx.invoice}`) 
            });
            // Jika ditolak dan BELUM dikirim, kasih kesempatan cancel lagi kalau mau
            if (!isReady && !isTransit && !isDelivered) {
              buttons.push({ 
                label: "Cancel order", 
                className: "border-zinc-200 text-zinc-500", 
                onClick: () => onCancel(trx) 
              });
            }
          }
        } 
        
        // --- LOGIKA KEDUA: TRACKING ---
        // Hanya tampilkan Lacak jika TIDAK sedang dalam proses pembatalan PENDING
        if ((isReady || isTransit) && cancelStatus !== 'PENDING') {
          buttons.push({ 
            label: "Track package", 
            className: "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800", 
            onClick: () => onOpenTracking(trx) 
          });
        }

        // --- LOGIKA KETIGA: CANCEL BARU ---
        // Jika tidak ada request sama sekali dan belum masuk proses kirim
        if (!hasCancelReq && !isReady && !isTransit && !isDelivered) {
          buttons.push({ 
            label: "Cancel order", 
            className: "border-zinc-200 text-zinc-500 hover:bg-zinc-50", 
            onClick: () => onCancel(trx) 
          });
        }

        // --- LOGIKA KEEMPAT: DELIVERED ---
        if (isDelivered) {
          buttons.push({ 
            label: "Return items", 
            className: "border-zinc-200 text-zinc-600 hover:bg-zinc-50", 
            onClick: () => onReturn(trx) 
          });
          buttons.push({ 
            label: "Buy again", 
            className: "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800", 
            onClick: () => router.push(`/our-products`) 
          });
        }
        break;

      case "SHIPPED":
        // Di status SHIPPED biasanya pembatalan sudah tidak bisa, jadi fokus ke Lacak
        buttons.push({ 
          label: "Track package", 
          className: "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800", 
          onClick: () => onOpenTracking(trx) 
        });
        break;

      case "COMPLETED":
        if (hasReturnReq) {
          buttons.push({ 
            label: "Review return", 
            className: "border-orange-100 text-orange-600 bg-orange-50/50", 
            onClick: () => router.push(`/user/orders/refund/${trx.invoice}`) 
          });
        } else {
          buttons.push({ 
            label: "Return items", 
            className: "border-zinc-200 text-zinc-600 hover:bg-zinc-50", 
            onClick: () => onReturn(trx) 
          });
        }
        buttons.push({ 
          label: "Buy again", 
          className: "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800", 
          onClick: () => router.push(`/our-products`) 
        });
        break;

      default:
        if (trx.status === "CANCELLED" || trx.status === "EXPIRED") {
          buttons.push({ 
            label: "View details", 
            className: "border-zinc-200 text-zinc-500 hover:bg-zinc-50", 
            onClick: () => router.push(`/user/orders/cancellation/${trx.invoice}`) 
          });
          buttons.push({ 
            label: "Buy again", 
            className: "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800", 
            onClick: () => router.push(`/our-products`) 
          });
        }
        break;
    }

    return buttons;
  };

  const buttons = getButtons();

  return (
    <div className="flex gap-2 justify-end">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.onClick(e);
          }}
          className={`
            px-3 py-2 text-xs font-semibold transition-all duration-200 
            rounded-full border flex items-center justify-center min-w-[100px]
            ${btn.className}
          `}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};