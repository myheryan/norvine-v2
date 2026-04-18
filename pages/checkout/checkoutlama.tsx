"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Head from 'next/head'
import { FiChevronLeft } from 'react-icons/fi'

import { useCart } from '@/components/context/CartContext'
import OrderItems from '@/components/checkout/OrderItems'
import OrderSummary from '@/components/checkout/OrderSummary'
import CheckoutAddressSection from '@/components/checkout/CheckoutAddressSection'
import PromoModal from '@/components/checkout/PromoModal'
import { NORVINE_CONFIG } from '@/types/norvine-default'
import { WeightToGram } from '@/lib/utils'


export default function CheckoutPage() {
  const router = useRouter()
  const { status } = useSession()
  const { clearPurchasedItems } = useCart();
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
// Di dalam CheckoutPage.tsx
const [orderData, setOrderData] = useState({ 
  items: [] as any[], 
  subtotal: 0, 
  discount: 0,
  appliedPromo: null as any 
})

  const [address, setAddress] = useState({
    recipientName: '', recipientPhone: '', fullAddress: '',
    district: '', city: '', province: '', postalCode: ''
  })

  const [notes, setNotes] = useState('')
  const [options, setOptions] = useState({ shipping: '', payment: 'qris' })

  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [isCheckingShipping, setIsCheckingShipping] = useState(false)
  const [useInsurance, setUseInsurance] = useState(false)

  // 1. LOAD DATA DARI STORAGE
  useEffect(() => {
    setIsMounted(true);
    if (!router.isReady) return;

    const buyNowData = localStorage.getItem('pending_checkout');
    const cartPayload = sessionStorage.getItem("norvine_checkout_payload");

    let dataWasFound = false;

    if (buyNowData) {
      try {
        const parsed = JSON.parse(buyNowData);
        if (parsed.items?.length > 0) {
          setOrderData({
            items: parsed.items,
            subtotal: parsed.subtotal || 0,
            discount: 0,
            appliedPromo: { code: null, name: '' }
          });
          dataWasFound = true;
        }
      } catch (e) { console.error(e); }
    } 
    
    if (!dataWasFound && cartPayload) {
      try {
        const parsed = JSON.parse(cartPayload);
        if (parsed.items?.length > 0) {
          setOrderData(prev => ({
            ...prev,
            items: parsed.items,
            subtotal: parsed.subtotal || 0
          }));
          dataWasFound = true;
        }
      } catch (e) { console.error(e); }
    }

    if (!dataWasFound) {
      router.replace('/cart');
    }
  }, [router.isReady]);


const logistics = useMemo(() => {

  return orderData.items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 1;
    
    const convertedWeight = Number(WeightToGram(item.weight));
    const itemWeight = convertedWeight > 0 ? convertedWeight : NORVINE_CONFIG.DEFAULT_WEIGHT; 

    const dim = item.dimensions || {};
    const defDim = NORVINE_CONFIG.DEFAULT_DIMENSIONS;
    
    const currentHeight = Number(dim.height) || defDim.height || 0;
    const currentLength = Number(dim.length) || defDim.length || 0;
    const currentWidth = Number(dim.width) || defDim.width || 0;

    acc.maxHeight = Math.max(acc.maxHeight === 0 ? 12 : acc.maxHeight, currentHeight);
    acc.maxLength = Math.max(acc.maxLength === 0 ? 5 : acc.maxLength, currentLength);
    acc.totalWidth += currentWidth * qty;
    acc.totalWeight += itemWeight * qty;

    return acc;
  }, { totalWeight: 0,  totalWidth: 0,  maxLength: 0,  maxHeight: 0 });
}, [orderData?.items]); 


  useEffect(() => {
    const fetchRealShipping = async () => {
      if (address.district && address.city && logistics.totalWeight > 0) {
        setIsCheckingShipping(true)
        try {
          const destinationStr = `${address.district}, ${address.city}`.toUpperCase()
          const res = await fetch('/api/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              destination: destinationStr, 
              weight: logistics.totalWeight,
              width: logistics.totalWidth,
              length: logistics.maxLength,
              height: logistics.maxHeight

            })
            
          })

          const rawResponse = await res.json()

          if (rawResponse.result && rawResponse.result.length > 0) {
            const mappedRates = rawResponse.result.map((item: any) => ({
              service_type: item.service_type,
              product: item.product,
              total_tariff: item.total_tariff,
              estimasi_sla: item.estimasi_sla,
              status: item.status
            }))

            setShippingRates(mappedRates)
            const firstActive = mappedRates.find((rate: any) => rate.status === 'ACTIVE')

            if (firstActive) {
              setSelectedRate(firstActive)
              setOptions(prev => ({ ...prev, shipping: firstActive.product })) 
            } else {
              setSelectedRate(null)
              setOptions(prev => ({ ...prev, shipping: '' }))
              toast.error("Tidak ada layanan pengiriman aktif untuk wilayah ini")
            }
          } else {
            setShippingRates([])
            setSelectedRate(null)
          }
        } catch (error) {
          toast.error("Gagal mengambil tarif pengiriman")
        } finally {
          setIsCheckingShipping(false)
        }
      }
    }

    fetchRealShipping()
  }, [address.district, address.city, logistics]);

  // 4. KALKULASI TOTAL AKHIR
  const subtotalAfterDiscount = orderData.subtotal - orderData.discount;
  const shippingCost = selectedRate ? selectedRate.total_tariff : NORVINE_CONFIG;
  const insuranceCost = useInsurance ? Math.round(subtotalAfterDiscount * NORVINE_CONFIG.INSURANCE_RATE) : 0;
  const serviceFee = NORVINE_CONFIG.SERVICE_FEE;
  const total = Math.round(subtotalAfterDiscount + shippingCost + insuranceCost + serviceFee);

  const handleShippingChange = (serviceProduct: string) => {
    const rate = shippingRates.find(r => r.product === serviceProduct)
    if (rate && rate.status === 'ACTIVE') {
      setSelectedRate(rate)
      setOptions(prev => ({ ...prev, shipping: serviceProduct }))
    }
  }

  // 5. SUBMIT HANDLER
  const handleFinalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.fullAddress || !address.recipientName) {
      toast.error("Lengkapi alamat pengiriman dulu, kak.");
      return;
    }

    if (!selectedRate) {
      toast.error("Layanan pengiriman tidak tersedia atau belum dipilih.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        orderId: `NORV-${Date.now()}`,
        notes,
        grossAmount: total,
        useInsurance,
        paymentMethod: options.payment, 
        shippingService: options.shipping,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        district: address.district.trim().toUpperCase(),
        city: address.city.trim().toUpperCase(),
        totalWeight: logistics.totalWeight,
        dimensions: {
        width: logistics.totalWidth,
        length: logistics.maxLength,
        height: logistics.maxHeight
        },
        address: `${address.fullAddress}, ${address.district}, ${address.city}, ${address.province} ${address.postalCode}`,
        items: orderData.items.map((i: any) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: Number(i.quantity),
          price: Number(i.price),
          weight: Number(i.weight) // Snapshot berat per item
        })),
        promoCode: orderData.appliedPromo?.code || null
      };

      const res = await fetch("/api/charge", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        const variantIdsPembelian = payload.items.map((i: any) => i.variantId);
        sessionStorage.removeItem("norvine_checkout_payload");
        localStorage.removeItem('pending_checkout');
        clearPurchasedItems(variantIdsPembelian);

        router.push(`/payment/${resData.transaction.invoice}`);
      } else {
        toast.error(resData.error || "Gagal memproses pembayaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isCheckoutDisabled = isSubmitting || isCheckingShipping || !selectedRate;

  if (!isMounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[10px] tracking-[0.3em] text-zinc-600 font-normal">
        LOADING
      </div>
    )
  }

  return (
    <>
      <Head><title>Checkout | NORVINE</title></Head>
      <div className="min-h-screen bg-neutral-100 md:pt-8 pb-20 font-normal text-zinc-800 rounded-none">
        <header className="lg:hidden bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30 border-b border-zinc-100">
          <button type="button" onClick={() => router.back()}><FiChevronLeft size={20} /></button>
          <h1 className="text-xs uppercase tracking-[0.2em]">Checkout</h1>
        </header>

        <div className="max-w-[1150px] mx-auto md:px-6">
          <form onSubmit={handleFinalCheckout} className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="flex-1 w-full space-y-4">
              <CheckoutAddressSection selectedAddr={address} setAddress={setAddress} />
              
              <OrderItems 
                items={orderData.items} 
                options={options} 
                setOptions={(newOpt: any) => {
                  if (newOpt.shipping) {
                    handleShippingChange(newOpt.shipping)
                  } else {
                    setOptions(newOpt)
                  }
                }}
                shippingData={{ 
                  active: shippingRates.length > 0, 
                  services: shippingRates 
                }}
                isCheckingShipping={isCheckingShipping}
                notes={notes}
                setNotes={setNotes}
                useInsurance={useInsurance}
                setUseInsurance={setUseInsurance}
              />
            </div>

            <OrderSummary 
              options={options} 
              setOptions={setOptions} 
              subtotal={orderData.subtotal} 
              discount={orderData.discount} 
              shippingCost={shippingCost} 
              insuranceCost={insuranceCost} 
              serviceFee={serviceFee}      
              total={total}           
              isSubmitting={isSubmitting} 
              setOrderData={setOrderData}
              setIsModalOpen={setIsModalOpen}
              appliedPromo={orderData.appliedPromo}
              isCheckoutDisabled={isCheckoutDisabled}
            />
          </form>
        </div>
      </div>

      <PromoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        subtotal={orderData.subtotal} 
        items={orderData.items} 
        appliedPromo={orderData.appliedPromo}
        setOrderData={setOrderData} 
      />
    </>
  )
}