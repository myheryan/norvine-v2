import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PaymentView from '@/components/checkout/PaymentView';
import { toast } from 'sonner';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query; 

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/orders/${id}`);
        const data = await res.json();

        if (res.ok) {
          // --- LOGIKA PROTEKSI STATUS ---
          const status = data?.status;
          const successStatuses = ['PAID', 'SETTLEMENT', 'SUCCESS', 'CAPTURE'];
          const failedStatuses = ['EXPIRED', 'CANCELLED', 'DENY'];

          // 1. Jika sudah dibayar, langsung ke halaman detail order
          if (successStatuses.includes(status)) {
            toast.success("Pesanan ini sudah dibayar");
            router.replace(`/user/orders/${id}`);
            return;
          }

          // 2. Jika sudah hangus/batal, balik ke daftar order
          if (failedStatuses.includes(status)) {
            toast.error("Transaksi ini sudah tidak aktif");
            router.replace('/user/orders');
            return;
          }

          // 3. Jika masih PENDING, baru tampilkan PaymentView
          setOrderData(data);
        } else {
          toast.error("Pesanan tidak ditemukan");
          router.replace('/user/orders');
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        toast.error("Gagal memuat data pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router.isReady]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Jika data tidak ada atau status tidak valid, jangan render apapun (karena sudah di-redirect)
  if (!orderData) return null;

  return (
    <div className="w-full flex justify-center min-h-screen bg-gray-50/30">
      <PaymentView paymentData={orderData} />
    </div>
  );
}