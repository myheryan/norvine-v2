export interface OrderItem {
  id: string;
  quantity: number;
  priceAtBuy: number;
  product?: {
    name: string;
    thumbnailUrl?: string;
  };
  variant?: {
    name: string;
  };
}

export interface Order {
  id: string;
  invoice: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  waybill?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
}

const [order, setOrder] = useState<Order | null>(null);