import { Button } from "@/components/ui/baseInput";
import { useRouter } from "next/router";

interface ActionButtonProps {
  trx: any;
  handlePayment: (e: React.MouseEvent, trx: any) => void;
  onOpenTracking: (trx: any) => void;
  onCancel: (trx: any) => void;
  onComplain: (trx: any) => void;
}

export const OrderActionButton = ({ 
  trx, 
  handlePayment, 
  onOpenTracking, 
  onCancel, 
  onComplain 
}: ActionButtonProps) => {
  const router = useRouter();

  const getButtons = () => {
    const buttons = [];

    switch (trx.status) {
      case "PENDING":
        buttons.push({
          label: "Batal",
          className: "text-zinc-400 hover:text-red-500 hover:border-red-500",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            onCancel(trx);
          },
        });
        buttons.push({
          label: "Bayar Sekarang",
          className: "bg-zinc-800 text-white hover:brightness-95 shadow-sm",
          onClick: (e: any) => {
            e.stopPropagation();
            handlePayment(e, trx);
          },
        });
        break;

      case "PAID":
        // BOLEH BATAL JIKA BARU PAID (BELUM SETTLEMENT/PROCESSING)
        buttons.push({
          label: "Batalkan Pesanan",
          className: "text-zinc-400 hover:text-red-500 hover:border-red-500",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            onCancel(trx);
          },
        });
        buttons.push({
          label: "Lihat Invoice",
          className: "text-white hover:bg-zinc-50",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            router.push(`/invoice/${trx.invoice}`);
          },
        });
        break;

      case "SETTLEMENT":
      case "PROCESSING":
        buttons.push({
          label: "Lihat Invoice",
          className: "text-white hover:bg-zinc-50",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            router.push(`/invoice/${trx.invoice}`);
          },
        });
        break;

      case "SHIPPED":
        // TAMBAHKAN KOMPLAIN SAAT DI JALAN
        buttons.push({
          label: "Komplain",
          className: "border border-orange-200 text-orange-500 hover:bg-orange-50",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            onComplain(trx);
          },
        });
        buttons.push({
          label: "Lacak Pesanan",
          className: "text-white hover:bg-black",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            onOpenTracking(trx);
          },
        });
        break;

      case "COMPLETED":
        buttons.push({
          label: "Komplain",
          className: "border border-orange-200 text-orange-500 hover:bg-orange-50",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            onComplain(trx);
          },
        });
        buttons.push({
          label: "Beli Lagi",
          className: "text-white hover:bg-black",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            router.push(`/our-products`);
          },
        });
        break;

      case "EXPIRED":
      case "CANCELLED":
        buttons.push({
          label: "Beli Lagi",
          className: "text-zinc-400 hover:text-zinc-900",
          onClick: (e: any) => {
            e.preventDefault(); e.stopPropagation();
            router.push(`/our-products`);
          },
        });
        break;
    }

    return buttons;
  };

  const buttons = getButtons();
  if (buttons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {buttons.map((btn, index) => (
        <Button
          key={index}
          onClick={btn.onClick}
          className={`bg-zinc-900 px-4 py-2 rounded-full text-[11px] font-black uppercase transition-all ${btn.className}`}
        >
          {btn.label}
        </Button>
      ))}
    </div>
  );
};