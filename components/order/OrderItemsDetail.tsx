// components/order/OrderItemsDetail.tsx

import Image from "next/image";
import { displayStatus, formatDate, formatIDR, getCloudinaryImage } from "@/lib/utils";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface OrderItemsDetailProps {
  order: any;
  isFailed?: boolean;
}

export default function OrderItemsDetail({ order, isFailed }: OrderItemsDetailProps) {
  if (!order) return null;

const [isOpen, setIsOpen] = useState(false);


  const copyInvoice = (e: React.MouseEvent, inv: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(inv);
    toast.success("Invoice disalin");
  };

  return (
    <div className="bg-white shadow-sm overflow-hidden border border-gray-100">
      <div className="divide-y divide-gray-50">
        {/* 1. HEADER: INVOICE & STATUS */}
        <div className="flex px-4 py-2 items-center justify-between bg-white text-[13px] font-semibold text-black">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={(e) => copyInvoice(e, order.invoice)}
          >
            <span className="tracking-tight">
              {order.invoice}
            </span>
            <Copy size={12} className="text-gray-300 group-hover:text-black transition-colors" />
          </div>
          
          <span className={`font-semibold ${isFailed ? 'text-red-500' : 'text-zinc-950'}`}>
            {displayStatus(order)}
          </span>
        </div>

        {/* 2. LIST ITEMS (Disamakan dengan Card Utama) */}
        <div className="divide-y divide-gray-50">
          {order.items?.map((item: any) => (
            <div key={item.id} className="p-3 flex gap-2 items-start">
              {/* Thumbnail disamakan: h-14 w-14 rounded-2xl */}
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                <Image 
                  src={getCloudinaryImage(item.product?.thumbnailUrl || "/placeholder.png", 200, 200)} 
                  alt="product" 
                  fill 
                  className="object-cover" 
                />
              </div>

              {/* Info Produk */}
              <div className="flex-1 min-w-0 flex flex-col justify-start">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-[13px] font-medium text-gray-800 line-clamp-2">
                    {item.product?.name}
                  </h4>
                  <span className="text-[13px] text-black shrink-0">
                    {formatIDR(item.priceAtBuy)}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-1">
                  <p className="text-[12px] text-gray-700">
                    {item.variant?.name || "-"}
                  </p>
                  <span className="text-[12px] font-medium text-gray-500">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    <div className="bg-[#fafafa] p-4 border-t border-gray-100 flex justify-end">
        <div className="w-full md:max-w-[320px]">
          <div className={`${isOpen ? "block" : "hidden"} md:block space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 mb-3`}>  
            {/* B. LIST RINCIAN BIAYA */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500">Subtotal Produk</span>
                <span className="text-black tabular-nums">{formatIDR(order.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="text-black tabular-nums">{formatIDR(order.shippingCost)}</span>
              </div>
              {order.insuranceCost > 0 && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500">Asuransi</span>
                  <span className="text-black tabular-nums">{formatIDR(order.insuranceCost)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500">Voucher Diskon</span>
                  <span className="text-red-500 tabular-nums">-{formatIDR(order.discount)}</span>
                </div>
              )}
              
              {order.serviceFee > 0 && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500">Service Fee</span>
                  <span className="text-black tabular-nums">{formatIDR(order.serviceFee)}</span>
                </div>
              )}
            </div>
          </div>
                <div className="cursor-pointer md:cursor-default" onClick={() => setIsOpen(!isOpen)}>
            <div className={`flex md:justify-between items-center gap-2 ${isOpen ? "justify-between" : "justify-end"} `}>
                <span className="text-black text-sm">
                  Total Pesanan:
                </span>
              <div className="flex flex-row gap-2 items-center">
                <span className="text-[16px ] font-black text-black tracking-tighter leading-none tabular-nums">
                  {formatIDR(order.totalAmount)}
                </span>
                {/* Icon indikator hanya muncul di mobile */}
                <span className="md:hidden">
                  {isOpen ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                </span>            
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
  );
}