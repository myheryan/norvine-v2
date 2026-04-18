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
import { toast } from 'sonner'
import LoadingScreen from "@/components/ui/LoadingScreen"

const getKey = (item: CartItem) => item.variantId;

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { cartItems, removeFromCart, setCartItems, isInitialized } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, []);

  // Inisialisasi seleksi: Otomatis uncheck jika stok <= 0
  useEffect(() => {
    if (isInitialized) {
      setSelected(prev => 
        cartItems.reduce((acc, item) => ({ 
          ...acc, 
          // Safely check stock: default to false if stock property is missing or 0
          [getKey(item)]: (item.stock ?? 1) > 0 ? (prev[getKey(item)] ?? true) : false 
        }), {})
      );
    }
  }, [cartItems, isInitialized]);

  // Perhitungan Subtotal & Count
  const selectedItems = useMemo(() => cartItems.filter(i => selected[getKey(i)] && (i.stock ?? 1) > 0), [cartItems, selected]);
  const selectedCount = useMemo(() => selectedItems.reduce((sum, item) => sum + item.quantity, 0), [selectedItems]);
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.filter(i => (i.stock ?? 1) > 0).length;
  const subtotal = useMemo(() => selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0), [selectedItems]);

  const toggleAll = () => {
    const nextState = !allSelected;
    setSelected(cartItems.reduce((acc, item) => ({ 
      ...acc, [getKey(item)]: (item.stock ?? 1) > 0 ? nextState : false 
    }), {}));
  };

  const toggle = (item: CartItem) => {
    if ((item.stock ?? 1) <= 0) return;
    setSelected(p => ({ ...p, [getKey(item)]: !p[getKey(item)] }));
  };
  
  const removeSelected = async () => {
    selectedItems.forEach(i => removeFromCart(i.variantId));
    toast.success("Item terpilih dihapus");
  };

  const updateQty = (item: CartItem, delta: number) => {
    const maxStock = item.stock ?? 999;
    const newQty = Math.max(1, Math.min(maxStock, item.quantity + delta));

    if (delta > 0 && item.quantity >= maxStock) {
      toast.error(`Batas stok tercapai (${maxStock} item)`);
      return;
    }

    if (newQty === item.quantity) return;

    // Update Local State (Optimistic Update)
    setCartItems((prev) => prev.map(i => getKey(i) === getKey(item) ? { ...i, quantity: newQty } : i));

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    // Sync ke Database jika Login
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
        } catch (err) { console.error("Sync Error:", err); }
      }, 1000);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    localStorage.removeItem('pending_checkout');

    const payload = {
      items: selectedItems.map(i => ({
        productId: i.id,
        variantId: i.variantId,
        name: i.name,
        variant: i.variant,
        price: i.price,
        quantity: i.quantity,
        thumbnailUrl: i.thumbnailUrl,
        weight: i.weight ?? 0.1, // Penting untuk logistik
      })),
      subtotal: subtotal
    };

    try {
      sessionStorage.setItem("norvine_checkout_payload", JSON.stringify(payload));
      router.push('/checkout');
    } catch (error) { toast.error("Gagal memproses keranjang"); }
  };

  if (!isInitialized) return <LoadingScreen />

  const EmptyCart = () => (
    <div className="bg-white p-10 md:p-20 flex flex-col items-center justify-center text-center rounded-lg border border-slate-100">
      <div className="w-48 h-48 relative mb-6">
        <Image src="/empty-cart.png" alt="Empty" fill className="object-contain opacity-80" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Keranjang belanjamu kosong</h2>
      <Link href="/our-products" className="bg-zinc-950 text-white px-10 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition">Mulai Belanja</Link>
    </div>
  );

  return (
    <>
      <HeadMeta title='Keranjang Belanja | NORVINE' robots="noindex, nofollow" />      
      <Desktop>
        <div className="min-h-screen bg-white pb-32 pt-8 text-[#31353B]">
          <div className="max-w-[1100px] mx-auto px-4">
            <h1 className="text-2xl font-bold mb-6 text-zinc-950 tracking-tight font-sans">Keranjang</h1>
            {cartItems.length === 0 ? <EmptyCart /> : (
              <div className="flex gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200 mb-4 uppercase text-xs font-bold tracking-widest">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="tkp-checkbox" checked={allSelected} onChange={toggleAll} />
                      <span>Pilih Semua ({cartItems.length})</span>
                    </div>
                    {selectedItems.length > 0 && <button onClick={removeSelected} className="text-red-500 hover:underline">Hapus</button>}
                  </div>

                  <div className="space-y-6">
                    {cartItems.map((item) => {
                      const isOutOfStock = (item.stock ?? 1) <= 0;
                      return (
                        <div key={getKey(item)} className={`border-b border-slate-100 pb-6 ${isOutOfStock ? 'opacity-40' : ''}`}>
                          <div className="flex gap-4">
                            <input type="checkbox" className="tkp-checkbox" checked={!!selected[getKey(item)]} onChange={() => toggle(item)} disabled={isOutOfStock} />
                            <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                              <Image src={getCloudinaryImage(item.variantImageUrl || item.thumbnailUrl, 200, 200)} alt={item.name} fill className="object-contain" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-bold mb-1 line-clamp-2 text-slate-800">{item.name}</h3>
                              <p className="text-[10px] text-slate-400 mb-2 italic">Varian: {item.variant}</p>
                              {isOutOfStock ? <p className="text-[10px] text-red-500 font-bold italic uppercase">Stok Habis</p> : <p className="font-bold text-base text-zinc-950">{formatRp(item.price)}</p>}
                            </div>
                            <div className="flex flex-col items-end justify-between py-1">
                              <button onClick={() => removeFromCart(item.variantId)} className="text-slate-300 hover:text-red-500 transition"><FiTrash2 size={18} /></button>
                              {!isOutOfStock && (
                                <div className="flex items-center border border-slate-300 rounded-full px-2 py-1 h-8 bg-white shadow-sm">
                                  <button onClick={() => updateQty(item, -1)} disabled={item.quantity <= 1} className="p-1 text-zinc-950 disabled:opacity-20"><FiMinus size={14}/></button>
                                  <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                  <button onClick={() => updateQty(item, 1)} disabled={item.quantity >= (item.stock ?? 999)} className="p-1 text-zinc-950 disabled:opacity-20"><FiPlus size={14}/></button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="w-[350px] sticky top-32 font-sans">
                  <div className="border border-slate-200 rounded-xl p-6 shadow-sm bg-white">
                    <h3 className="font-bold text-sm mb-6 uppercase tracking-widest">Ringkasan Belanja</h3>
                    <div className="flex justify-between text-sm mb-4 text-slate-500 font-medium">
                      <span>Total Harga ({selectedCount} barang)</span>
                      <span>{formatRp(subtotal)}</span>
                    </div>
                    <hr className="my-4 border-slate-100" />
                    <div className="flex justify-between items-center mb-8">
                      <span className="font-medium text-slate-600">Total Tagihan</span>
                      <span className="font-bold text-xl text-zinc-950 tracking-tighter">{formatRp(subtotal)}</span>
                    </div>
                    <button onClick={handleCheckout} disabled={selectedItems.length === 0} className="w-full bg-zinc-950 text-white py-4 rounded-xl font-bold hover:bg-zinc-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all text-xs tracking-widest uppercase">Check out ({selectedCount})</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Desktop>

      <Mobile>
        <div className="min-h-screen bg-white pb-32 font-sans text-[#31353B]">
          <header className="bg-white px-4 py-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 z-30">
            <Link href="/our-products"><FiChevronLeft size={26} /></Link>
            <h1 className="text-lg font-bold text-zinc-950 tracking-tight">Keranjang</h1>
          </header>
          {cartItems.length === 0 ? <EmptyCart /> : (
            <div className="mt-1">
              <div className="px-4 py-3 flex justify-between items-center border-b-8 border-slate-50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="tkp-checkbox" checked={allSelected} onChange={toggleAll} />
                    <span className="font-bold text-sm uppercase">Pilih Semua ({selectedCount})</span>
                  </div>
                  {selectedItems.length > 0 && <button onClick={removeSelected} className="text-sm font-bold text-red-500">Hapus</button>}
              </div>
              {cartItems.map((item) => {
                const isOutOfStock = (item.stock ?? 1) <= 0;
                return (
                  <div key={getKey(item)} className={`p-4 border-b border-slate-50 ${isOutOfStock ? 'opacity-40 bg-slate-50' : ''}`}>
                    <div className="flex gap-3">
                      <input type="checkbox" className="tkp-checkbox" checked={!!selected[getKey(item)]} onChange={() => toggle(item)} disabled={isOutOfStock} />
                      <div className="w-20 h-20 relative rounded-md border border-slate-100 bg-white overflow-hidden shrink-0 shadow-sm">
                        <Image src={getCloudinaryImage(item.variantImageUrl || item.thumbnailUrl, 150, 150)} alt={item.name} fill className="object-contain" />
                      </div>
                      <div className="flex-1 text-sm flex flex-col justify-between">
                        <div>
                          <h3 className="line-clamp-2 leading-snug font-bold text-slate-800">{item.name}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 tracking-widest font-bold uppercase italic">Varian: {item.variant}</p>
                          {isOutOfStock ? <p className="text-[10px] text-red-500 font-bold italic mt-1 uppercase">Stok Habis</p> : <p className="font-bold mt-1 text-zinc-950 tracking-tight">{formatRp(item.price)}</p>}
                        </div>
                        <div className="flex justify-end items-center mt-2 gap-4">
                          <button onClick={() => removeFromCart(item.variantId)} className="text-slate-300"><FiTrash2 size={18} /></button>
                          {!isOutOfStock && (
                            <div className="flex items-center border border-slate-300 rounded-lg h-8 px-1 bg-white">
                              <button onClick={() => updateQty(item, -1)} disabled={item.quantity <= 1} className="p-1.5 text-zinc-950 disabled:opacity-20"><FiMinus size={14}/></button>
                              <span className="w-7 text-center text-xs font-black">{item.quantity}</span>
                              <button onClick={() => updateQty(item, 1)} disabled={item.quantity >= (item.stock ?? 999)} className="p-1.5 text-zinc-950 disabled:opacity-20"><FiPlus size={14}/></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex items-center justify-between z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Harga</span>
              <span className="font-bold text-lg text-zinc-950 tracking-tighter">{formatRp(subtotal)}</span>
            </div>
            <button onClick={handleCheckout} disabled={selectedItems.length === 0} className="bg-zinc-950 text-white px-10 py-3 rounded-xl font-bold text-xs tracking-widest uppercase disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-zinc-100">Checkout ({selectedCount})</button>
          </div>
        </div>
      </Mobile>
    </>
  );
}