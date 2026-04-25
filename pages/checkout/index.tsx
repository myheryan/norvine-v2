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
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function CheckoutPage() {
  const router = useRouter()
  const { status } = useSession()
  const { clearPurchasedItems } = useCart();
  
  const [isMounted, setIsMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [orderData, setOrderData] = useState({ 
    items: [] as any[], 
    subtotal: 0, 
    discount: 0,
    appliedPromo: null as any 
  })

  // State Alamat Terstruktur (Snapshot untuk OrderAddress)
  const [address, setAddress] = useState({
    recipientName: '', 
    recipientPhone: '', 
    fullAddress: '',
    district: '', 
    city: '', 
    province: '', 
    postalCode: ''
  })

  const [notes, setNotes] = useState('')
  const [options, setOptions] = useState({ shipping: '', payment: 'qris' })

  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [isCheckingShipping, setIsCheckingShipping] = useState(false)
  const [shippingErrorMessage, setShippingErrorMessage] = useState<string | null>(null)
  const [useInsurance, setUseInsurance] = useState(false)
  const [hasPendingOrder, setHasPendingOrder] = useState<string | null>(null)

  useEffect(() => {
    const checkPendingOrder = async () => {
      try {
        const res = await fetch('/api/user/check-pending');
        const data = await res.json();
        if (data.hasPending) setHasPendingOrder(data.invoice);
      } catch (e) { console.error("Error checking pending order"); }
    };
    if (status === 'authenticated') checkPendingOrder();
  }, [status]);

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
          setOrderData(prev => ({ ...prev, items: parsed.items, subtotal: parsed.subtotal || 0 }));
          dataWasFound = true;
        }
      } catch (e) { console.error(e); }
    }

    if (!dataWasFound) router.replace('/cart');
  }, [router.isReady]);

  const logistics = useMemo(() => {
    return orderData.items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 1;
      const convertedWeight = Number(WeightToGram(item.weight));
      const itemWeight = convertedWeight > 0 ? convertedWeight : NORVINE_CONFIG.DEFAULT_WEIGHT; 

      const dim = item.dimensions || {};
      const defDim = NORVINE_CONFIG.DEFAULT_DIMENSIONS;
      
      const currentHeight = Number(dim.height) || defDim.height || 12;
      const currentLength = Number(dim.length) || defDim.length || 5;
      const currentWidth = Number(dim.width) || defDim.width || 0;

      acc.maxHeight = Math.max(acc.maxHeight, currentHeight);
      acc.maxLength = Math.max(acc.maxLength, currentLength);
      acc.totalWidth += currentWidth * qty;
      acc.totalWeight += itemWeight * qty;

      return acc;
    }, { totalWeight: 0, totalWidth: 0, maxLength: 0, maxHeight: 0 });
  }, [orderData.items]); 

  useEffect(() => {
    const fetchRealShipping = async () => {
      if (address.district && address.city && logistics.totalWeight > 0) {
        setIsCheckingShipping(true);
        setShippingErrorMessage(null);
        
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
              status: item.status,
              origin_code: rawResponse.origin, 
              destination_code: rawResponse.destination,
            }))

            setShippingRates(mappedRates)
            const firstActive = mappedRates.find((rate: any) => rate.status === 'ACTIVE')
            if (firstActive) {
              setSelectedRate(firstActive)
              setOptions(prev => ({ ...prev, shipping: firstActive.product })) 
            }
          } else {
            setShippingRates([])
            setSelectedRate(null)
            setShippingErrorMessage(rawResponse.message?.id || "Layanan pengiriman tidak tersedia");
          }
        } catch (error) {
          setShippingErrorMessage("Gagal memuat tarif pengiriman");
        } finally {
          setIsCheckingShipping(false)
        }
      }
    }
    fetchRealShipping()
  }, [address.district, address.city, logistics]);

  const subtotalAfterDiscount = orderData.subtotal - orderData.discount;
  const shippingCost = selectedRate ? selectedRate.total_tariff : 0;
  const insuranceCost = useInsurance ? Math.ceil(subtotalAfterDiscount * NORVINE_CONFIG.INSURANCE_RATE) : 0;
  const total = Math.round(subtotalAfterDiscount + shippingCost + insuranceCost + NORVINE_CONFIG.SERVICE_FEE);

  const handleFinalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullAddress || !address.recipientName) {
      return toast.error("Lengkapi alamat pengiriman dulu, kak.");
    }
    if (!selectedRate) {
      return toast.error(shippingErrorMessage || "Pilih kurir terlebih dahulu.");
    }

    setIsSubmitting(true);
    try {
      // PAYLOAD TERSTRUKTUR (Sesuai Skema Prisma Baru)
      const payload = {
        orderId: `NORV-${Date.now()}`,
        paymentGateway: 'XENDIT',
        paymentMethod: options.payment,
        notes,
        grossAmount: total,
        useInsurance,
        
        // Data untuk tabel OrderAddress
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        addressSnapshot: {
          fullAddress: address.fullAddress,
          district: address.district,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode
        },

        // Data untuk tabel Shipment
        shippingDetails: {
          courierCode: 'LION',
          courierService: selectedRate.product, 
          serviceType: selectedRate.service_type,
          originCode: selectedRate.origin_code,
          destinationCode: selectedRate.destination_code, 
          tariff: selectedRate.total_tariff,
          weight: logistics.totalWeight,
          insuranceAmount: insuranceCost,
          dimensions: {
            length: logistics.maxLength,
            width: logistics.totalWidth,
            height: logistics.maxHeight
          }
        },

        items: orderData.items.map((i: any) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: Number(i.quantity),
          price: Number(i.price),
          weight: Number(i.weight) 
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
        sessionStorage.removeItem("norvine_checkout_payload");
        localStorage.removeItem('pending_checkout');
        clearPurchasedItems(payload.items.map((i: any) => i.variantId));

        router.push({
          pathname: `/payment/${resData.invoice}`,
          query: { qr: resData.qr_string, amt: resData.amount, exp: resData.expiry_time }
        });
      } else {
        toast.error(resData.error || "Gagal memproses pembayaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted || status === 'loading') return <LoadingScreen />

  return (
    <>
      <Head><title>Checkout | NORVINE</title></Head>
      <div className="min-h-screen bg-neutral-50 md:pt-8 pb-20 font-sans text-zinc-900">
        <header className="lg:hidden bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30 border-b border-zinc-100">
          <button type="button" onClick={() => router.back()}><FiChevronLeft size={20} /></button>
          <h1 className="text-xs uppercase tracking-[0.2em] font-medium">Checkout</h1>
        </header>

        <div className="max-w-[1150px] mx-auto md:px-6">
          <form onSubmit={handleFinalCheckout} className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full space-y-4">
              <CheckoutAddressSection selectedAddr={address} setAddress={setAddress} />
              
              <OrderItems 
                items={orderData.items} 
                options={options} 
                setOptions={(newOpt: any) => {
                  if (newOpt.shipping) {
                    const rate = shippingRates.find(r => r.product === newOpt.shipping)
                    if (rate && rate.status === 'ACTIVE') {
                      setSelectedRate(rate)
                      setOptions(prev => ({ ...prev, shipping: newOpt.shipping }))
                    }
                  } else { setOptions(newOpt) }
                }}
                shippingData={{ active: shippingRates.length > 0, services: shippingRates }}
                isCheckingShipping={isCheckingShipping}
                shippingErrorMessage={shippingErrorMessage}
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
              serviceFee={NORVINE_CONFIG.SERVICE_FEE}      
              total={total}           
              isSubmitting={isSubmitting} 
              isCheckingShipping={isCheckingShipping} 
              selectedRate={selectedRate} 
              setOrderData={setOrderData}
              setIsModalOpen={setIsModalOpen}
              appliedPromo={orderData.appliedPromo}
              isCheckoutDisabled={isSubmitting || isCheckingShipping || !selectedRate || !!hasPendingOrder}
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