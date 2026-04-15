"use client"

import Image from "next/image"
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { FiTrash2, FiMinus, FiPlus, FiChevronLeft } from 'react-icons/fi'
import { Desktop, Mobile } from '@/components/responsive'
import HeadMeta from '@/components/HeadMeta'
import { useSession } from 'next-auth/react'
import { useCart, CartItem } from '@/components/context/CartContext'
import { formatRp, getCloudinaryImage } from '@/lib/utils'
import { CartSkeleton } from '@/components/skeleton/CartSkeleton'
import { toast } from 'sonner'

const getKey = (item: CartItem) => item.variantId;

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { cartItems, removeFromCart, setCartItems, isInitialized } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setSelected(prev => 
        cartItems.reduce((acc, item) => ({ 
          ...acc, 
          [getKey(item)]: prev[getKey(item)] ?? true 
        }), {})
      );
    }
  }, [cartItems, isInitialized]);

  const selectedItems = useMemo(() => cartItems.filter(i => selected[getKey(i)]), [cartItems, selected]);
  
  const selectedCount = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.quantity, 0), 
    [selectedItems]
  );

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  const subtotal = useMemo(() => selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0), [selectedItems]);

  const toggleAll = () => setSelected(cartItems.reduce((acc, item) => ({ ...acc, [getKey(item)]: !allSelected }), {}));
  const toggle = (item: CartItem) => setSelected(p => ({ ...p, [getKey(item)]: !p[getKey(item)] }));
  
  const removeSelected = async () => {
    const idsToRemove = selectedItems.map(i => i.variantId);
    idsToRemove.forEach(id => removeFromCart(id));
  };

  const updateQty = (item: CartItem, delta: number) => {
    const newQty = Math.max(1, Math.min(100, item.quantity + delta));
    if (newQty === item.quantity) return;

    setCartItems((prev) => prev.map(i => getKey(i) === getKey(item) ? { ...i, quantity: newQty } : i));

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    if (status === 'authenticated') {
      syncTimerRef.current = setTimeout(async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              variantId: item.variantId, 
              quantity: newQty, 
              isAbsolute: true 
            }),
          });
        } catch (err) {
          console.error("Sync Error:", err);
        }
      }, 1000);
    }
  };

const handleCheckout = () => {
  if (selectedItems.length === 0) return;

  // 1. Hapus data Buy Now agar tidak menimpa data keranjang di halaman checkout
  localStorage.removeItem('pending_checkout');

  const payload = {
    items: selectedItems.map(i => ({
      productId: i.id,
      variantId: i.variantId,
      name: i.name,
      variant: i.variant,
      price: i.price,
      quantity: i.quantity,
      thumbnailUrl: i.thumbnailUrl
    })),
    subtotal: subtotal
  };

  try {
    sessionStorage.setItem("norvine_checkout_payload", JSON.stringify(payload));
    router.push('/checkout');
  } catch (error) {
    toast.error("Gagal memproses keranjang");
  }
};

  if (!isInitialized) return <CartSkeleton itemsCount={3} />

  const EmptyCart = () => (
    <div className="bg-white p-10 md:p-20 flex flex-col items-center justify-center text-center rounded-lg border border-slate-100">
      <div className="w-48 h-48 relative mb-6">
        <Image src="/empty-cart.png" alt="Empty" fill className="object-contain opacity-80" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Keranjang belanjamu kosong</h2>
      <Link href="/our-products" className="bg-zinc-950 text-white px-10 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition">
        Mulai Belanja
      </Link>
    </div>
  );

  return (
    <>
      <HeadMeta title='Keranjang Belanja | NORVINE' robots="noindex, nofollow" />       

      <Desktop>
        <div className="min-h-screen bg-white pb-32 pt-8 text-[#31353B]">
          <div className="max-w-[1100px] mx-auto px-4">
            <h1 className="text-2xl font-semibold mb-6 text-zinc-950">Keranjang</h1>
            {cartItems.length === 0 ? <EmptyCart /> : (
              <div className="flex gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200 mb-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="tkp-checkbox" checked={allSelected} onChange={toggleAll} />
                      <span className="text-sm font-semibold">Pilih Semua ({cartItems.length})</span>
                    </div>
                    {selectedItems.length > 0 && (
                      <button onClick={removeSelected} className="text-red-500 font-semibold text-sm hover:underline">Hapus</button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={getKey(item)} className="border-b border-slate-100 pb-6">
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <input type="checkbox" className="tkp-checkbox" checked={!!selected[getKey(item)]} onChange={() => toggle(item)} />
                          </div>
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                            <Image 
                              src={getCloudinaryImage(item.variantImageUrl || item.thumbnailUrl, 200, 200)} 
                              alt={item.name} fill className="object-contain" 
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium mb-1 line-clamp-2 text-slate-800">{item.name}</h3>
                            <p className="text-[11px] text-slate-400 mb-2 tracking-tight uppercase">Varian: {item.variant}</p>
                            <p className="font-bold text-base">{formatRp(item.price)}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between py-1">
                            <button onClick={() => removeFromCart(item.variantId)} className="text-slate-400 hover:text-red-500 transition">
                              <FiTrash2 size={18} />
                            </button>
                            <div className="flex items-center border border-slate-300 rounded-full px-2 py-1 h-8 bg-white">
                              <button onClick={() => updateQty(item, -1)} disabled={item.quantity <= 1} className="p-1 text-zinc-950 disabled:opacity-30">
                                <FiMinus size={14}/>
                              </button>
                              <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                              <button onClick={() => updateQty(item, 1)} className="p-1 text-zinc-950">
                                <FiPlus size={14}/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-[350px] sticky top-32">
                  <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                    <h3 className="font-bold text-base mb-4">Ringkasan Belanja</h3>
                    <div className="flex justify-between text-sm mb-3 text-slate-500">
                      <span>Total Harga ({selectedCount} barang)</span>
                      <span>{formatRp(subtotal)}</span>
                    </div>
                    <hr className="my-4 border-slate-100" />
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-normal text-base">Total</span>
                      <span className="font-bold text-xl text-zinc-950">{formatRp(subtotal)}</span>
                    </div>
                    <button 
                      onClick={handleCheckout} 
                      disabled={selectedItems.length === 0} 
                      className="w-full bg-zinc-950 text-white py-3.5 rounded-xl font-bold hover:bg-zinc-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all text-base"
                    >
                      Beli ({selectedCount})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Desktop>

      {/* Versi Mobile tetap menggunakan handleCheckout yang sama */}
      <Mobile>
        <div className="min-h-screen bg-white pb-32 font-sans text-[#31353B]">
          <header className="bg-white px-4 py-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 z-30">
            <Link href="/our-products"><FiChevronLeft size={26} /></Link>
            <h1 className="text-lg font-semibold text-zinc-950">Keranjang</h1>
          </header>

          {cartItems.length === 0 ? <EmptyCart /> : (
            <div className="mt-1">
              <div className="px-4 py-3 flex justify-between items-center border-b-8 border-slate-50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="tkp-checkbox" checked={allSelected} onChange={toggleAll} />
                    <span className="font-bold text-sm">Pilih Semua ({selectedCount})</span>
                  </div>
                  {selectedItems.length > 0 && (
                    <button onClick={removeSelected} className="text-sm font-bold text-red-500">Hapus</button>
                  )}
              </div>

              {cartItems.map((item) => (
                <div key={getKey(item)} className="p-4 border-b border-slate-50">
                  <div className="flex gap-3">
                    <div className="flex items-center">
                      <input type="checkbox" className="tkp-checkbox" checked={!!selected[getKey(item)]} onChange={() => toggle(item)} />
                    </div>
                    <div className="w-20 h-20 relative rounded-md border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                      <Image 
                        src={getCloudinaryImage(item.variantImageUrl || item.thumbnailUrl, 150, 150)} 
                        alt={item.name} fill className="object-contain" 
                      />
                    </div>
                    <div className="flex-1 text-sm flex flex-col justify-between">
                      <div>
                        <h3 className="line-clamp-2 leading-snug font-medium text-slate-800">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">Varian: {item.variant}</p>
                        <p className="font-bold mt-1 text-zinc-950">{formatRp(item.price)}</p>
                      </div>
                      <div className="flex justify-end items-center mt-2 gap-4">
                        <button onClick={() => removeFromCart(item.variantId)} className="text-slate-400">
                          <FiTrash2 size={18} />
                        </button>
                        <div className="flex items-center border border-slate-300 rounded-lg h-8 px-1 bg-white">
                          <button onClick={() => updateQty(item, -1)} disabled={item.quantity <= 1} className="p-1.5 text-zinc-950 disabled:opacity-30">
                            <FiMinus size={14}/>
                          </button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item, 1)} className="p-1.5 text-zinc-950">
                            <FiPlus size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex items-center justify-between z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Total Harga</span>
              <span className="font-bold text-lg text-zinc-950">{formatRp(subtotal)}</span>
            </div>
            <button onClick={handleCheckout} disabled={selectedItems.length === 0} className="bg-zinc-950 text-white px-10 py-3 rounded-xl font-bold text-sm disabled:bg-slate-200">
              Beli ({selectedCount})
            </button>
          </div>
        </div>
      </Mobile>
    </>
  );
}