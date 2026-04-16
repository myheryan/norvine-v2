import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PaymentView from '@/components/checkout/PaymentView'; // Sesuaikan path komponenmu
import { toast } from 'sonner';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query; // ID di sini adalah nomor Invoice (misal: NORV-123)

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchOrder = async () => {
      try {
        // Panggil API route yang mengambil data transaction berdasarkan invoice
        const res = await fetch(`/api/user/orders/${id}`);
        const data = await res.json();

console.log("Data dari API:", data);
        if (res.ok) {
          setOrderData(data);
                  setLoading(false);

        } else {
          toast.error("Pesanan tidak ditemukan");
          router.push('/user/orders');
        }
      } catch (err) {
        toast.error("Gagal memuat data pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router.isReady]);

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (!orderData) return null;

  return (
  // PaymentPage.tsx
  <div className="w-full flex itrme justify-center">
    
    <PaymentView paymentData={orderData} />

  </div>
  );
}