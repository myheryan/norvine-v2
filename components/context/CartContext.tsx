"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

export interface CartItem {
  id: string;          // Ini Product ID
  cartItemId?: string;  // ID unik dari model CartItem prisma
  variantId: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  variantImageUrl?: string;
  thumbnailUrl?: string; 
  weight: number; 
  dimensions?: {
    length: number;
    width: number;
    height: number;
  } | any; // Gunakan any jika kamu menyimpan JSON mentah dari Prisma
}

interface CartContextType {
  cartItems: CartItem[]
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: string) => void
  clearPurchasedItems: (variantIds: string[]) => void // Fungsi baru untuk selective clear
  cartCount: number
  isInitialized: boolean 
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 1. LOAD DATA DARI API ATAU LOCALSTORAGE
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          // Mapping data dari schema Prisma ke interface CartItem
          const mappedData = data.map((item: any) => ({
            cartItemId: item.id,
            id: item.variant?.productId,
            variantId: item.variantId,
            name: item.variant?.product?.name || "Product",
            variant: item.variant?.name || "Default",
            price: item.variant?.price || 0,
            quantity: item.quantity,
            variantImageUrl: item.variant?.imageUrl, 
            thumbnailUrl: item.variant?.product?.thumbnailUrl 
          }));
          
          setCartItems(mappedData)
          setIsInitialized(true)
        })
        .catch(() => setIsInitialized(true))
    } else {
      const savedCart = localStorage.getItem('norvine_cart')
      if (savedCart) setCartItems(JSON.parse(savedCart))
      setIsInitialized(true)
    }
  }, [status])

  // Sync localStorage untuk tamu (guest)
  useEffect(() => {
    if (status !== 'authenticated' && isInitialized) {
      localStorage.setItem('norvine_cart', JSON.stringify(cartItems))
    }
  }, [cartItems, status, isInitialized])

  // 2. LOGIKA ADD TO CART
  const addToCart = async (newItem: CartItem) => {
    setCartItems(prev => {
      const exist = prev.find(i => i.variantId === newItem.variantId);
      if (exist) return prev.map(i => i.variantId === newItem.variantId ? {...i, quantity: i.quantity + newItem.quantity} : i);
      return [...prev, newItem];
    });

    if (status === 'authenticated') {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: newItem.variantId, quantity: newItem.quantity }),
      });
    }
  }

  // 3. LOGIKA REMOVE PER ITEM
  const removeFromCart = async (variantId: string) => {
    setCartItems(prev => prev.filter(i => i.variantId !== variantId));
    if (status === 'authenticated') {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });
    }
  }

  // 4. LOGIKA SELECTIVE CLEAR (Hapus barang yang dibeli saja)
  const clearPurchasedItems = (variantIds: string[]) => {
    setCartItems(prev => {
      // Simpan barang yang variantId-nya TIDAK ada dalam daftar pembelian
      const remainingItems = prev.filter(item => !variantIds.includes(item.variantId));
      
      // Update localStorage (untuk guest atau backup persistensi)
      if (status !== 'authenticated') {
        localStorage.setItem('norvine_cart', JSON.stringify(remainingItems));
      }
      
      return remainingItems;
    });
  }

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems, 
      addToCart, 
      removeFromCart, 
      clearPurchasedItems, // Ekspos fungsi baru
      cartCount: cartItems.reduce((t, i) => t + i.quantity, 0), 
      isInitialized 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}