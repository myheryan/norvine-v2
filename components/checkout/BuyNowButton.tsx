"use client"

import { useRouter } from 'next/router';
import { FiZap } from 'react-icons/fi';

// Sesuaikan tipe data ini dengan struktur data produkmu
interface ProductData {
  productId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
}

interface VariantData {
  variantId: string;
  name: string; // Misal: "Hitam - XL"
  imageUrl?: string;
}

interface BuyNowButtonProps {
  product: ProductData;
  selectedVariant: VariantData | null;
  quantity: number;
}

export default function BuyNowButton({ product, selectedVariant, quantity }: BuyNowButtonProps) {
  const router = useRouter();

  const handleBuyNow = () => {
    // 1. Validasi: Pastikan varian sudah dipilih jika produk memiliki varian
    if (!selectedVariant) {
      alert("Pilih varian produk terlebih dahulu!");
      return;
    }

    // 2. Susun data payload yang formatnya sama persis seperti yang ada di Cart
    const buyNowPayload = {
      items: [
        {
          productId: product.productId,
          variantId: selectedVariant.variantId,
          name: product.name,
          price: product.price,
          quantity: quantity,
          variant: selectedVariant.name,
          thumbnailUrl: product.thumbnailUrl,
          variantImageUrl: selectedVariant.imageUrl,
        }
      ],
      subtotal: product.price * quantity,
    };

    // 3. Push ke halaman checkout dengan menyembunyikan payload di URL
    router.push(
      {
        pathname: '/checkout',
        query: { payload: JSON.stringify(buyNowPayload) }
      },
      '/checkout' // Parameter 'as' ini membuat URL bar hanya menampilkan "/checkout"
    );
  };

  return (
    <button
      onClick={handleBuyNow}
      disabled={!selectedVariant}
      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-white bg-black hover:bg-gray-800 disabled:bg-zinc-200 disabled:text-zinc-600 transition-all shadow-lg active:scale-95"
    >
      <FiZap className={selectedVariant ? "text-yellow-400" : "text-zinc-600"} size={18} />
      BUY NOW
    </button>
  );
}