// components\order\OrderItemsDetail.tsx

import Image from "next/image";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { displayStatus, formatRp, getCloudinaryImage } from "@/lib/utils";
import { Copy } from "lucide-react";

interface OrderItemsDetailProps {
  order: any;
  isFailed?: boolean;
}


export default function OrderItemsDetail({ order, isFailed }: OrderItemsDetailProps) {
  if (!order) return null;

  const getStatusStyles = () => {
  // 1. Kondisi Gagal / Batal
  if (isFailed) return "bg-red-50 text-red-500 border border-red-100";
  
  if (order.status === "PAID" || order.status === "COMPLETED") return "bg-emerald-600 text-white";
  
  // 5. Default (Pending/Lainnya)
  return "bg-zinc-900 text-white";
};

  return (
            <div className="bg-white shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                <div className="flex p-2 gap-2 items-center justify-between border-b border-gray-100">
                  <button className="flex items-center gap-2">
                      <span className="text-xs font-semibold">Pesanan : {order.invoice}</span>
                      <Copy size={12} className="text-gray-600" />
                    </button>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm ${getStatusStyles()}`}>
                  { displayStatus(order.status, order.shipment?.status)}
                </span>
                </div>
                {order.items?.map((item: any) => (
                  <div key={item.id} className="p-3 flex gap-3 items-center">
                    <div className="w-16 h-16 relative bg-gray-50 border border-gray-100 shrink-0">
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
                   {/* Kondisional: Asuransi */}
                    {order.insuranceCost > 0 && (
                      <tr>
                        <td className="text-right">Asuransi</td>
                        <td className="text-right text-gray-800">
                          {formatRp(order.insuranceCost)}
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
                        <div className="flex justify-end items-center w-full gap-8">
                          <span className="text-gray-900 font-bold text-lg">
                            Total Pesanan
                          </span>
                          <span className="text-[20px] font-bold text-[#ee4d2d] tracking-tighter leading-none">
                            {formatRp(order.totalAmount)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  );
}