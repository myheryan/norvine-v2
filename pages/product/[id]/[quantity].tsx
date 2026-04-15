"use client"

import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Collapsible } from '@base-ui/react';
import { MdOutlineKeyboardArrowLeft, MdOutlineShoppingBag } from 'react-icons/md'
import { FiMinus, FiPlus, FiShoppingBag, FiShoppingCart, FiZap } from 'react-icons/fi'

// --- Import Prisma ---
import prisma from '@/lib/prisma'

import Product from '@/components/ourProducts/Product'
import ProductCarousel from '@/components/ourProducts/ProductCarousel'
import HeadMeta from '@/components/HeadMeta'
import { useCart } from '@/components/context/CartContext'
import { formatRp, replaceSpace } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// --- 1. GET STATIC PATHS ---
export async function getStaticPaths() {
  const products = await prisma.product.findMany({
    select: { 
      id: true, 
      variants: { select: { name: true } } 
    },
  })

  let paths = products.flatMap((product) => {
    if (!product.variants || product.variants.length === 0) return [];
    
    return product.variants.map((variant) => {
      return {
        params: {
          id: product.id.toLowerCase(), 
          quantity: variant.name.toLowerCase().trim().replace(/\s+/g, '-'),
        },
      };
    });
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

// --- 2. GET STATIC PROPS ---
export async function getStaticProps({
  params,
}: {
  params: { id: string; quantity: string }
}) {
  const productId = typeof params.id === 'string' ? params.id : ''

  const productDb = await prisma.product.findUnique({
    where: { id: productId },
    include: { categories: true, variants: true }
  })

  if (!productDb) {
    return { notFound: true }
  }

  const compositionData = productDb.attributes || []

  const product = {
    ...productDb,
    thumbnailUrl: productDb.thumbnailUrl,
    createdAt: productDb.createdAt.toISOString(),
    updatedAt: productDb.updatedAt.toISOString(),
    composition: compositionData,
    quantity: productDb.variants.map(v => v.name),
    variants: productDb.variants.map(v => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })),
    shortDescription: (productDb as any).shortDescription || '', 
    interaction: (productDb as any).interaction || '',
    contraindication: (productDb as any).contraindication || '',
    isUsageAndDose: (productDb as any).isUsageAndDose || false,
  }

  const allOtherProducts = await prisma.product.findMany({
    where: { id: { not: productId } },
    include: { variants: true } 
  })
  
  const shuffled = allOtherProducts.sort(() => 0.5 - Math.random()).slice(0, 5)
  
  const randomProducts = shuffled.map((p) => {
    const displayPrice = p.variants.length > 0 ? p.variants[0].price : 0;
    const displayQuantity = p.variants.map(v => v.name);

    return [
      p.id, 
      {
        ...p,
        price: displayPrice,
        quantity: displayQuantity,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        variants: p.variants.map(v => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }))
      }
    ]
  })

  return {
    props: {
      product,
      randomProducts,
      initialUrlQuantity: params.quantity, 
    },
    revalidate: 60,
  }
}

// --- 3. KOMPONEN UTAMA ---
export default function ProductDetail({
  product,
  randomProducts,
  initialUrlQuantity,
}: {
  product: any
  randomProducts: any[]
  initialUrlQuantity: string 
}) {
  const router = useRouter()
  const { id } = router.query

  const defaultQuantity = useMemo(() => {
    if (!product || !Array.isArray(product.quantity)) return undefined;
    
    const matchedQuantity = product.quantity.find(
      (q: string) => q.toLowerCase().replace(/\s+/g, '-') === initialUrlQuantity
    );
    
    return matchedQuantity || product.quantity[0];
  }, [product, initialUrlQuantity]);

  let [activeQuantity, setActiveQuantity] = useState<string | undefined>(defaultQuantity)
  let [itemQuantity, setItemQuantity] = useState(1)
  let [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    if (product && Array.isArray(product.quantity)) {
      const matched = product.quantity.find(
        (q: string) => q.toLowerCase().replace(/\s+/g, '-') === initialUrlQuantity
      );
      setActiveQuantity(matched || product.quantity[0]);
      setItemQuantity(1);
    }
  }, [product, initialUrlQuantity]);

  const activeVariantData = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find((v: any) => v.name === activeQuantity) || product.variants[0];
  }, [product, activeQuantity]);

  // --- LOGIKA BARCODE AMAN ---
  const currentBarcode = useMemo(() => {
    if (!activeVariantData || !activeVariantData.barcode) return '';

    const barcode = activeVariantData.barcode;
    if (typeof barcode === 'object') {
      return barcode.code ?? ''; 
    }
    return String(barcode);
  }, [activeVariantData]);

  let productUrls = useMemo(() => {
    if (activeQuantity && product) {
      let quantityKey = replaceSpace(activeQuantity.toLowerCase())
      return getProductUrlPath({ key: product.id, quantityKey })
    }
  }, [activeQuantity, product])

  const currentPrice = activeVariantData ? activeVariantData.price : 0;

  // --- HANDLER: MASUKKAN KE KERANJANG ---
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      variantId: activeVariantData?.id,
      name: product.name,
      variant: activeQuantity || (Array.isArray(product.quantity) ? product.quantity[0] : ''),
      thumbnailUrl: product.thumbnailUrl || productUrls && productUrls.length > 0 ? productUrls[0] : '',
      quantity: itemQuantity,
      price: currentPrice,
      weight: activeVariantData?.weight || 0.1,
      dimensions: activeVariantData?.dimensions || { length: 5, width: 5, height: 12 }
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    // 1. Hapus payload checkout keranjang agar checkout fokus ke item ini saja
    sessionStorage.removeItem("norvine_checkout_payload");

    const buyNowPayload = {
      items: [{
        productId: product.id,
        variantId: activeVariantData?.id,
        name: product.name,
        price: currentPrice,
        quantity: itemQuantity,
        variant: activeQuantity,
        thumbnailUrl: product.thumbnailUrl || productUrls?.[0] || '', 
        // MENAMBAHKAN DATA LOGISTIK KE PAYLOAD BUY NOW
        weight: activeVariantData?.weight || 0.1,
        dimensions: activeVariantData?.dimensions || { length: 5, width: 5, height: 12 }
      }],
      subtotal: currentPrice * itemQuantity,
    };

    // 2. Simpan dan Navigasi
    localStorage.setItem('pending_checkout', JSON.stringify(buyNowPayload));
    router.push('/checkout');
  };

  if (!product) return <></>

  let {
    regNumber,
    name,
    description,
    quantity = [], 
    customBgColor,
    categories
  } = product

  const categoryName = categories && categories.length > 0 
    ? categories[0].name 
    : 'Our Products'

  return (
    <div>
      <HeadMeta
        title={`${name} - ${currentBarcode} - Norvine`}
        description={`${name} - ${currentBarcode}  - ${product?.shortDescription}`}
      />

      <div className="mb-8 md:mb-23 flex flex-col md:flex-row">
        <div className="w-full md:w-[48.33%]">
          <div className={`w-full md:aspect-[520/640] lg:aspect-[928/944] ${customBgColor ? 'bg-[#E6EBE9]' : 'bg-[#F3E08D]'}`}>
            {productUrls && <ProductCarousel data={productUrls} />}
          </div>
        </div>

        <div className="w-full flex-1 px-4 mt-8 md:mt-0 md:px-16">
          <div className="hidden md:flex mb-5 h-32 items-center py-8">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer outline-none"
            >
              <MdOutlineKeyboardArrowLeft size={28} className="text-[#1D1E20]" />
            </button>

            <Breadcrumb>
              <BreadcrumbList className="txt-h5 font-bold text-gray-500 sm:gap-2">
                <BreadcrumbItem>
                  <BreadcrumbLink >
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink >
                    <Link href="/our-products">Our products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink >
                    <Link href={`/our-products?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#EC0000] font-bold">
                    {name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="txt-mobile-h1 md:text-4xl lg:text-5xl font-bold tracking-wide">
            {name.toUpperCase()}
          </h1>

          {currentBarcode && (
            <p className="text-gray-500 mb-4 text-sm md:text-base">
              Kode Item : {currentBarcode}
            </p>
          )}

          <div
            className={`txt-mobile-body md:txt-body text-[#1D1E20] leading-relaxed mb-2 md:mb-2`}
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {regNumber && (
              <div className="flex flex-row items-start justify-start mb-4">
                <p className="txt-mobile-h3 md:txt-body mr-2 text-gray-500">No. Reg:</p>
                <p className="txt-mobile-h3 md:txt-body font-bold text-emerald-500">{regNumber}</p>
              </div>
          )}

          <div className="mb-8 flex flex-row md:items-center gap-4 md:gap-0">
            {quantity && (
            <div className="flex flex-row overflow-x-auto hide-scrollbar items-center md:mr-6">
              <p className="txt-body mr-4 hidden md:block">Isi:</p>
              {quantity?.map((q: string) => {
                let active = activeQuantity === q
                return (
                  <Link
                    href={`/product/${id}/${q.toLowerCase().replace(/\s+/g, '-')}`}
                    key={q}
                    scroll={false}
                    className={`rounded-full border-2 mr-2 py-2 px-4 md:py-1 transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'txt-mobile-h4 md:txt-h5 bg-[#1D1E20] text-white border-transparent font-bold'
                        : 'txt-mobile-h5 md:txt-h5 bg-white border-[#1D1E2020] font-bold'
                    }`}
                  >
                    {q}
                  </Link>
                )
              })}
            </div>
            )}
          </div>

          <div className="flex text-xl md:text-2xl lg:text-4xl font-semibold text-[#1D1E20] mb-6">
            {formatRp(currentPrice)}
          </div>

          <div className="mb-16 flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-6">
            <div className="flex rounded-full items-center justify-between border-2 border-[#1D1E20] px-3 py-2 md:min-w-[140px] gap-4">
              <p className="text-base font-semibold text-[#1D1E20] block md:hidden">Quantity</p>
              <div className="flex items-center">
                <button onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))} className="p-1 outline-none"><FiMinus size={20}/></button>
                <span className="mx-4 font-bold">{itemQuantity}</span>
                <button onClick={() => setItemQuantity(prev => prev + 1)} className="p-1 outline-none"><FiPlus size={20}/></button>
              </div>
            </div>

            <div className="flex w-full md:flex-1 gap-4">
              {/* Tombol Add To Cart */}
              <button 
                onClick={handleAddToCart} 
                disabled={isAdded} 
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-white transition-all active:scale-95 border-2 ${isAdded ? 'bg-green-600 border-green-600' : 'bg-black border-black hover:bg-gray-800'}`}
              >
                <FiShoppingCart size={20} />
                <span className="font-bold uppercase text-xs md:text-sm">{isAdded ? 'ADDED' : 'ADD TO CART'}</span>
              </button>

              {/* Tombol Buy Now */}
              <button 
                onClick={handleBuyNow} 
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold transition-all active:scale-95 bg-zinc-950 hover:bg-orange-700 text-white"
              >
                <MdOutlineShoppingBag size={18} />
                <span className="uppercase text-xs md:text-sm">BUY NOW</span>
              </button>
            </div>
          </div>

          {/* Information Section (Base UI Collapsible) */}
          <div className="border-t border-black">
            <InfoCollapsible title="Composition">
              <ul className="text-sm space-y-2 opacity-80">
                {product.composition?.map((comp: any) => (
                  <li key={comp.name}>• {comp.name} {comp.unit && `(${comp.unit})`}</li>
                ))}
              </ul>
            </InfoCollapsible>

            {product.usage && (
              <InfoCollapsible title={product.isUsageAndDose ? "Dosage & Directions" : "Usage"}>
                <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">{product.usage}</p>
              </InfoCollapsible>
            )}

            <InfoCollapsible title="Caution">
              <p className="text-sm leading-relaxed opacity-80">{product.caution}</p>
              {product.warning && (
                <div className="mt-4 p-4 bg-zinc-50 border-l-2 border-black">
                   <p className="text-[10px] font-black tracking-widest mb-1 uppercase">Warning</p>
                   <p className="text-xs opacity-80">{product.warning}</p>
                </div>
              )}
            </InfoCollapsible>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="mx-4 md:mx-18 mb-8">
        <h1 className="txt-mobile-h1 md:txt-h1 uppercase">While You Are Still Here</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 lg:px-16">
        {randomProducts.map(([rid, rdata]: any) => (
          <Product key={rid} id={rid} {...rdata} />
        ))}
      </div>
      <div className="mb-20"></div>
    </div>
  )
}

// Sub-komponen Collapsible
function InfoCollapsible({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Collapsible.Root className="border-b border-black/10">
      <Collapsible.Trigger className="flex w-full items-center justify-between py-6 group outline-none">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{title}</span>
        <span className="text-xl transition-transform duration-300 group-data-[state=open]:rotate-45">+</span>
      </Collapsible.Trigger>
      <Collapsible.Panel className="overflow-hidden transition-all duration-300 data-[state=closed]:h-0 data-[state=open]:h-auto">
        <div className="pb-8">{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

function getProductUrlPath({ key, quantityKey }: any) {
  let folderPath = `/products/${key}/${quantityKey}`
  return [`${folderPath}/front.webp`, `${folderPath}/back.webp`, `${folderPath}/back-2.webp`]
}