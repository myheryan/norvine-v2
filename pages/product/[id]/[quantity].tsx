"use client"

import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { MdOutlineKeyboardArrowLeft, MdOutlineShoppingBag } from 'react-icons/md'
import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'
import { toast } from 'sonner' 

import prisma from '@/lib/prisma'

import Product from '@/components/ourProducts/Product'
import ProductCarousel from '@/components/ourProducts/ProductCarousel'
import HeadMeta from '@/components/HeadMeta'
import { useCart } from '@/components/context/CartContext'
import { formatRp } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { InfoCollapsible } from '@/components/ui/InfoCollapsible'

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
    isDisplayOnly: Boolean(productDb.isDisplayOnly),
    images: productDb.images || [],
    thumbnailUrl: productDb.thumbnailUrl,
    createdAt: productDb.createdAt.toISOString(),
    updatedAt: productDb.updatedAt.toISOString(),
    composition: compositionData,
    quantity: productDb.variants.map(v => v.name),
    variants: productDb.variants.map(v => ({
      ...v,
      imageUrl: v.imageUrl,
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
    const stockProduct = p.variants.map(v => v.stock)

    return [
      p.id, 
      {
        ...p,
        price: displayPrice,
        quantity: displayQuantity,
        stock: stockProduct,
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

  const [activeQuantity, setActiveQuantity] = useState<string | undefined>(undefined)
  const [itemQuantity, setItemQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  // 1. LOGIKA VARIAN AKTIF
  const activeVariantData = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find((v: any) => v.name === activeQuantity) || product.variants[0];
  }, [product, activeQuantity]);

  // 2. CHECK STOCK
  const isOutOfStock = useMemo(() => {
    if (product.isDisplayOnly) return false;
    return !activeVariantData || activeVariantData.stock <= 0;
  }, [activeVariantData, product.isDisplayOnly]);

  const currentStock = activeVariantData?.stock || 0;

  useEffect(() => {
    if (product && Array.isArray(product.quantity)) {
      const matched = product.quantity.find(
        (q: string) => q.toLowerCase().replace(/\s+/g, '-') === initialUrlQuantity
      );
      setActiveQuantity(matched || product.quantity[0]);
      setItemQuantity(1);
    }
  }, [product, initialUrlQuantity]);

  // 3. LOGIKA GAMBAR CAROUSEL
  const productUrls = useMemo(() => {
    const allImages: string[] = [];
    if (activeVariantData?.imageUrl) allImages.push(activeVariantData.imageUrl);
    if (product.thumbnailUrl && product.thumbnailUrl !== activeVariantData?.imageUrl) {
      allImages.push(product.thumbnailUrl);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: string) => {
        if (img !== activeVariantData?.imageUrl && img !== product.thumbnailUrl) {
          allImages.push(img);
        }
      });
    }
    return allImages;
  }, [activeVariantData, product.thumbnailUrl, product.images]);

  const currentPrice = activeVariantData ? activeVariantData.price : 0;
  const currentBarcode = useMemo(() => {
    if (!activeVariantData || !activeVariantData.barcode) return '';
    const barcode = activeVariantData.barcode;
    return typeof barcode === 'object' ? (barcode as any).code ?? '' : String(barcode);
  }, [activeVariantData]);

  // --- HANDLERS ---
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      variantId: activeVariantData?.id,
      name: product.name,
      variant: activeQuantity || '',
      thumbnailUrl: product.thumbnailUrl,
      quantity: itemQuantity,
      price: currentPrice,
      weight: activeVariantData?.weight || 0.1,
      stock: currentStock, // PERBAIKAN TYPO DI SINI
      dimensions: activeVariantData?.dimensions || { length: 5, width: 5, height: 12 }
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    sessionStorage.removeItem("norvine_checkout_payload");
    const buyNowPayload = {
      items: [{
        productId: product.id,
        variantId: activeVariantData?.id,
        name: product.name,
        price: currentPrice,
        quantity: itemQuantity,
        variant: activeQuantity,
        thumbnailUrl: product.thumbnailUrl, 
        weight: activeVariantData?.weight || 0.1,
        stock: currentStock,
        dimensions: activeVariantData?.dimensions || { length: 5, width: 5, height: 12 }
      }],
      subtotal: currentPrice * itemQuantity,
    };
    localStorage.setItem('pending_checkout', JSON.stringify(buyNowPayload));
    router.push('/checkout');
  };

  if (!product) return <></>

  let { regNumber, name, description, quantity = [], customBgColor, categories } = product
  const categoryName = categories?.[0]?.name || 'Our Products'

  return (
    <div className="font-sans">
      <HeadMeta
        title={`${name} - ${currentBarcode} - Norvine`}
        description={`${name} - ${currentBarcode} - ${product?.shortDescription}`}
      />

      <div className="mb-8 md:mb-23 flex flex-col md:flex-row">
        {/* Gallery */}
        <div className="w-full md:w-[48.33%]">
          <div className={`w-full md:aspect-[520/640] lg:aspect-[928/944] ${customBgColor ? 'bg-[#E6EBE9]' : 'bg-[#F3E08D]'}`}>
            {productUrls && <ProductCarousel key={activeVariantData?.id || 'default'} data={productUrls} />}
          </div>
        </div>

        {/* Info */}
        <div className="w-full flex-1 px-4 mt-8 md:mt-0 md:px-8 lg:px-16">
          <div className="hidden md:flex items-center py-8">
            <button onClick={() => router.back()} className="mr-4 p-1 hover:bg-slate-100 rounded-full transition-colors outline-none">
              <MdOutlineKeyboardArrowLeft size={28} className="text-[#1D1E20]" />
            </button>

            <Breadcrumb>
              <BreadcrumbList className="txt-h5 font-bold text-gray-500 sm:gap-2">
                <BreadcrumbItem><BreadcrumbLink><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink><Link href="/our-products">Our products</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink><Link href={`/our-products?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage className="text-[#EC0000] font-bold">{name}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="txt-mobile-h1 md:text-4xl lg:text-5xl font-bold tracking-wide mb-3">{name.toUpperCase()}</h1>

          {currentBarcode && <p className="text-gray-500 mb-4 text-sm md:text-base tracking-tight">Kode Item : {currentBarcode}</p>}

          <div className="txt-mobile-body md:txt-body text-[#1D1E20] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: description }} />

          {regNumber && (
            <div className="flex flex-row items-start justify-start mb-6">
              <p className="txt-mobile-h3 md:txt-body mr-2 text-gray-500">No. Reg:</p>
              <p className="txt-mobile-h3 md:txt-body font-bold text-emerald-500">{regNumber}</p>
            </div>
          )}

          {/* Varian / Isi */}
          <div className="mb-8 flex flex-row md:items-center gap-4 md:gap-0">
            {quantity && (
              <div className="flex flex-row overflow-x-auto hide-scrollbar items-center md:mr-6">
                <p className="txt-body mr-4 hidden md:block">Isi:</p>
                {quantity?.map((q: string) => (
                  <Link
                    href={`/product/${id}/${q.toLowerCase().replace(/\s+/g, '-')}`}
                    key={q}
                    scroll={false}
                    className={`rounded-full border-2 mr-2 py-2 px-4 md:py-1 transition-colors whitespace-nowrap  ${
                      activeQuantity === q
                        ? 'txt-mobile-h4 md:txt-h5 bg-[#1D1E20] text-white border-transparent'
                        : 'txt-mobile-h5 md:txt-h5 bg-white border-[#1D1E2020]'
                    }`}
                  >
                    {q}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Harga & Label Stok */}
          <div className="flex flex-row items-center gap-4 mb-8">
            <div className="flex text-2xl md:text-3xl lg:text-3xl font-semibold text-[#1D1E20]">
              {formatRp(currentPrice)} 
            </div>
            {isOutOfStock && !product.isDisplayOnly && (
              <span className="text-red-600  text-sm mt-2 italic"> Persediaan Habis</span>
            )}
            {!isOutOfStock && currentStock > 0 && currentStock <= 5 && (
              <span className="text-orange-600 text-sm mt-2 italic"> Sisa {currentStock} stok</span>
            )}
          </div>

          {/* Tombol Aksi */}
          {product.isDisplayOnly ? (
            <div className="w-full p-6 flex flex-col items-center justify-center bg-zinc-50 rounded-xl">
              <p className="text-[#1D1E20] text-center leading-relaxed">
                Produk hanya tersedia di apotek. Cek Mitra Apotek terdekat{" "}
                <Link href="/find-us" className="text-red-600 italic underline underline-offset-4 decoration-1 hover:text-blue-600">disini</Link>
              </p>
              <div className="mt-4 w-12 h-[1px] bg-[#1D1E20]"></div>
            </div>
          ) : ( 
            <div className="mb-16 flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-6">
              <div className={`flex rounded-full items-center justify-between border-2 border-zinc-600 px-4 py-1 md:min-w-[140px] gap-4 ${isOutOfStock ? 'opacity-30 pointer-events-none' : ''}`}>
                <p className="text-sm text-[#1D1E20] block md:hidden">Quantity</p>
                <div className="flex items-center">
                  <button onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))} className="p-1 outline-none"><FiMinus size={20}/></button>
                  <span className="mx-5">{itemQuantity}</span>
                  <button 
                    onClick={() => {
                      if (itemQuantity < currentStock) {
                        setItemQuantity(prev => prev + 1);
                      } else {
                        toast.error(`Stok tidak mencukupi`);
                      }
                    }} 
                    className="p-1 outline-none"
                  >
                    <FiPlus size={20}/>
                  </button>
                </div>
              </div>

              <div className="flex w-full md:flex-1 gap-4">
                <button 
                  onClick={handleAddToCart} 
                  disabled={isAdded || isOutOfStock} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-white transition-all active:scale-95 border-2 ${
                    isOutOfStock 
                      ? 'bg-zinc-200 border-zinc-200 text-zinc-400 cursor-not-allowed' 
                      : isAdded ? 'bg-emerald-600 border-emerald-600' : 'bg-black border-black hover:bg-zinc-800'
                  }`}
                >
                  {!isOutOfStock && <FiShoppingCart size={20} />}
                  <span className="font-semibold text-sm md:text-sm tracking-widest">{isOutOfStock ? 'OUT OF STOCK' : isAdded ? 'ADDED' : 'ADD TO CART'}</span>
                </button>

                {!isOutOfStock && (
                  <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all active:scale-95 bg-zinc-950 hover:bg-orange-700 text-white tracking-widest shadow-xl shadow-zinc-200">
                    <MdOutlineShoppingBag size={20} />
                    <span className="font-semibold text-sm md:text-sm tracking-widest">BUY NOW</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Info Tambahan */}
          <div className="border-t border-black">
            <InfoCollapsible title="Composition">
              <ul className="text-sm space-y-2 opacity-80 py-2">
                {product.composition?.map((comp: any) => (
                  <li key={comp.name}>• {comp.name} {comp.unit && `(${comp.unit})`}</li>
                ))}
              </ul>
            </InfoCollapsible>
            {product.usage && (
              <InfoCollapsible title={product.isUsageAndDose ? "Dosage & Directions" : "Usage"}>
                <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line py-2">{product.usage}</p>
              </InfoCollapsible>
            )}
            <InfoCollapsible title="Caution">
              <div className="py-2">
                <p className="text-sm leading-relaxed opacity-80">{product.caution}</p>
                {product.warning && (
                  <div className="mt-4 p-4 bg-zinc-50 border-l-2 border-red-600">
                    <p className="text-[10px] font-black tracking-widest mb-1 uppercase text-red-600">Warning</p>
                    <p className="text-xs opacity-80">{product.warning}</p>
                  </div>
                )}
              </div>
            </InfoCollapsible>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="mx-4 md:mx-18 mb-8 pt-20">
        <h1 className="txt-mobile-h1 md:txt-h1 uppercase tracking-tighter">While You Are Still Here</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 lg:px-16 mb-20">
        {randomProducts.map(([rid, rdata]: any) => (
          <Product key={rid} id={rid} {...rdata} />
        ))}
      </div>
    </div>
  )
}