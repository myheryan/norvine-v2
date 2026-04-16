import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md'
import FuzzySearch from 'fuzzy-search'

// Import Prisma dari file lib yang baru dibuat
import prisma from '../lib/prisma' 

import Product from '../components/ourProducts/Product'
import { Desktop, Mobile } from '@/components/responsive'
import HeadMeta from '@/components/HeadMeta'

import FilterBottomSheet from '../components/ourProducts/FilterBottomSheet'

// --- Tipe Data dari Database ---
type CategoryDb = { id: string; name: string }
type TypeDb = { id: string; name: string }
type ProductDb = {
  id: string
  name: string
  price: number // Sekarang didapat dari kalkulasi varian
  thumbnailUrl: string;
  thumbnailDescription?: string | null
  description?: string | null
  quantity: string[] // Sekarang didapat dari nama-nama varian
  usage?: string | null
  howMedWorks?: string | null
  howToStore?: string | null
  caution?: string | null
  sideEffect?: string | null
  warning?: string | null
  tag: string[]
  customBgColor?: boolean // Tambahkan opsional jika sewaktu-waktu tidak ada
  categories: CategoryDb[]
  types: TypeDb[]
  createdAt: string
  updatedAt: string
}

type Props = {
  categories: CategoryDb[]
  filters: TypeDb[]
  products: ProductDb[]
}

// 1. Tipe khusus agar cocok dengan komponen FilterBottomSheet yang tidak diubah
type StrictCategory = 
  | 'general-health'
  | 'bones-muscles-joints-health'
  | 'heart-health'
  | 'skin-health'
  | 'energy-vitality'
  | 'brain-health-memory'
  | 'hair-care'
  | undefined;

type StrictFilterKeys = 'vitamin' | 'herbal' | 'mineral' | 'asam-amino' | 'minyak-ikan';

export default function OurProducts({ categories, filters, products }: Props) {
  let router = useRouter()
  let { search, category } = router.query

  // Fungsi helper untuk mengecek validitas kategori dari URL
  const isCategoryKey = (cat: any) => categories.some((c) => c.id === cat)

  // 2. Terapkan StrictCategory pada useState aktif kategori
  let [activeCategory, setActiveCategory] = useState<StrictCategory>(
    isCategoryKey(category) ? (category as StrictCategory) : undefined
  )

  // 3. Terapkan StrictFilterKeys pada useState filters
  let [isFiltersChecked, setisFiltersChecked] = useState<Record<StrictFilterKeys, boolean>>({
    'vitamin': false,
    'herbal': false,
    'mineral': false,
    'asam-amino': false,
    'minyak-ikan': false,
  } as Record<StrictFilterKeys, boolean>)

  // Set default state filter ke 'false' saat komponen di-mount
  useEffect(() => {
    const initialFilters = filters.reduce((acc, curr) => {
      // Kita casting curr.id sebagai StrictFilterKeys agar Typescript tidak komplain
      acc[curr.id as StrictFilterKeys] = false
      return acc
    }, {} as Record<StrictFilterKeys, boolean>)
    
    // Jangan overwrite state jika user sudah melakukan interaksi
    setisFiltersChecked((prev) => (Object.keys(prev).length ? prev : initialFilters))
  }, [filters])

  // Logika Filter
  let filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Cek filter Kategori
        if (activeCategory) {
          return product.categories.some((c) => c.id === activeCategory)
        }
        return true
      })
      .filter((product) => {
        // Cek filter Tipe/Filters
        const isAnyFilterChecked = Object.values(isFiltersChecked).some(Boolean)
        
        // Jika tidak ada checkbox yang dicentang, tampilkan semua
        if (!isAnyFilterChecked) return true 

        // Jika ada yang dicentang, cek apakah produk memiliki tipe tersebut
        return product.types.some((t) => isFiltersChecked[t.id as StrictFilterKeys])
      })
  }, [activeCategory, isFiltersChecked, products])

  // Logika Search (Fuzzy Search)
  let searcher = useMemo(() => {
    return new FuzzySearch(
      filteredProducts,
      ['name', 'tag'],
      { sort: true }
    )
  }, [filteredProducts])

  let searchResult = useMemo(() => {
    return searcher.search((search as string) ?? '')
  }, [search, searcher])

  return (
    <>
   <HeadMeta 
        title="Our Products"
        description="Jelajahi seluruh koleksi terbaik dari Norvine. Gunakan filter kami untuk menemukan gaya, ukuran, dan warna yang paling pas untuk Anda."
        keywords="katalog norvine, produk norvine, koleksi norvine terbaru, belanja baju online, norvine official"
        url="https://norvine.co.id/our-products"
        ogImage="https://norvine.co.id/images/banners/banner-1.webp" // Ganti dengan URL banner katalog Anda
        type="website"
      />
    
        <div>
      <Desktop>
        <div className="mb-8 flex h-32 items-center px-18 pt-16 pb-8">
          <MdOutlineKeyboardArrowLeft size={24} />
          <h5 className="txt-h5 ml-4 font-bold">
            Home . Our products .{' '}
            <span className="text-[#EC0000]">Health supplements</span>
          </h5>
        </div>
        <div className="flex flex-row space-x-16 px-18 ">
          {/* Sidebar Filter */}
          <div className="lg:w-[24.75rem">
            <div className="mb-8 border-b px-4 pb-8">
              <h4 className="txt-h4 mb-8">Kategori</h4>
              <div className="space-y-4">
                {categories.map(({ id, name }) => (
                  <h5
                    onClick={() =>
                      setActiveCategory(activeCategory === id ? undefined : id as StrictCategory)
                    }
                    key={id}
                    className={`txt-h5 cursor-pointer select-none font-bold ${
                      activeCategory === id ? 'text-[#EC0000]' : 'text-[#777777]'
                    }`}
                  >
                    {name}
                  </h5>
                ))}
              </div>
            </div>
            <div>
              <div className="space-y-6 px-4">
                <h4 className="txt-h4">Filter</h4>
                {filters.map(({ id, name }) => (
                  <div className="mb flex items-center" key={id}>
                    <input
                      type="checkbox"
                      className="mr-4"
                      onChange={() => {
                        setisFiltersChecked((prev) => ({
                          ...prev,
                          [id as StrictFilterKeys]: !prev[id as StrictFilterKeys],
                        }))
                      }}
                      checked={!!isFiltersChecked[id as StrictFilterKeys]}
                    />{' '}
                    <h5>{name}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Grid Produk Desktop */}
          <div className="mb-48 grid max-w-4xl flex mx-auto md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 justify-center">
            {searchResult.map(({ id, ...product }) => (
              
              <Product key={id} id={id}  {...product} />
            ))}
          </div>
        </div>
      </Desktop>
      
      <Mobile>
        <div className="my-5 flex flex-row items-center justify-between">
          <FilterBottomSheet
            activeCategory={activeCategory}
            isFiltersChecked={isFiltersChecked}
            setActiveCategory={setActiveCategory}
            setisFiltersChecked={setisFiltersChecked}
          />
          <div className="no-scrollbar mx-4 flex flex-row space-x-4 overflow-x-scroll">
            {categories.map(({ id, name }) => (
              <h5
                onClick={() => setActiveCategory(activeCategory === id ? undefined : id as StrictCategory)}
                key={id}
                className={`txt-mobile-h4 flex select-none items-center whitespace-nowrap rounded-full border py-2 px-3 font-bold ${
                  activeCategory === id
                    ? 'border-[#F46666] bg-[#FDE5E5] text-[#F46666]'
                    : 'border-[#1D1E20] bg-[#FFFFFF] text-[#777777]'
                }`}
              >
                {name}
              </h5>
            ))}
          </div>
        </div>
        
        {/* Grid Produk Mobile */}
        <div className="flex flex-row space-x-4 px-4">
          <div className="mb-48 grid max-w-[1316px] flex-1 grid-cols-2 gap-x-4 gap-y-8">
            {searchResult.map((productData) => {
                const { id, ...otherProps } = productData;
             return <Product key={id} id={id} {...otherProps} />
            })}
          </div>
        </div>
      </Mobile>
    </div>
    </>

  )
}

export async function getStaticProps() {
  try {
    const categories = await prisma.category.findMany()
    const filters = await prisma.type.findMany()
    const products = await prisma.product.findMany({
      // 1. TAMBAHKAN include variants untuk mengambil data harga dan kemasan
      include: { categories: true, types: true, variants: true },
    })

const serializedProducts = products.map((product) => {
  const { variants, ...rest } = product;

  const displayPrice = variants.length > 0 ? variants[0].price : 0;
  const displayQuantity = variants.map(v => v.name);

  return {
    ...rest,
    name: product.name || "", 
    tag: Array.isArray(product.tag) ? product.tag : [],
    price: displayPrice,
    quantity: displayQuantity,
    thumbnailUrl: product.thumbnailUrl,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
})

    return {
      props: { categories, filters, products: serializedProducts },
      revalidate: 60, // SANGAT PENTING! Web akan otomatis meregenerasi halaman di background maksimal setiap 60 detik jika ada perubahan di database
    }
  } catch (error) {
    return { props: { categories: [], filters: [], products: [] } }
  }
}