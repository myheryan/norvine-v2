import { Button } from "@/components/ui/baseInput";
import { useRouter } from "next/router";

interface ActionButtonProps {
  trx: any;
  handlePayment: (e: React.MouseEvent, trx: any) => void;
  onOpenTracking: (trx: any) => void;
}

export const OrderActionButton = ({ trx, handlePayment, onOpenTracking }: ActionButtonProps) => {
  const router = useRouter();

  const getButtons = () => {
    const buttons = [];

    switch (trx.status) {
      case "PENDING":
        buttons.push({
          label: "Bayar Sekarang",
          className: "bg-zinc-800 text-white hover:brightness-95 shadow-sm",
          onClick: (e: any) => handlePayment(e, trx),
        });
        break;

      case "PAID":
      case "SETTLEMENT":
        // Tombol Detail Transaksi (Ke Invoice)
        buttons.push({
          label: "Lihat Detail Transaksi",
          className: "bg-zinc-950 border border-gray-200 text-gray-600 hover:bg-gray-50",
          onClick: (e: any) => {
            e.preventDefault();
            router.push(`/user/orders/${trx.invoice}`);
          },
        });
        break;

      case "SHIPPED":
        // Tombol Detail
        buttons.push({
          label: "Detail",
          className: "bg-zinc-950 border border-gray-200 text-gray-600 hover:bg-gray-50",
          onClick: (e: any) => {
            e.preventDefault();
            router.push(`/user/orders/${trx.invoice}`);
          },
        });
        // Tombol Lacak Pesanan (Buka Modal)
        buttons.push({
          label: "Lacak Pesanan",
          className: "bg-zinc-950 border border-[#ee4d2d] text-[#ee4d2d] hover:bg-orange-50",
          onClick: (e: any) => {
            e.preventDefault();
            onOpenTracking(trx);
          },
        });
        break;

      case "COMPLETED":
        buttons.push({
          label: "Beli Lagi",
          className: "border border-gray-300 text-gray-700 hover:bg-gray-50",
          onClick: (e: any) => {
            e.preventDefault();
            router.push(`/our-products`);
          },
        });
        break;

      case "EXPIRED":
        buttons.push({
          label: "Checkout Ulang",
          className: "bg-red-600 text-white hover:brightness-95",
          onClick: (e: any) => {
            e.preventDefault();
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
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn, index) => (
        <Button
          key={index}
          onClick={btn.onClick}
          disabled={btn.disabled}
          className={`px-5 py-2 rounded-full text-[12px] font-normal transition-all ${btn.className}`}
        >
          {btn.label}
        </Button>
      ))}
    </div>
  );
};