import Head from 'next/head'
import Image from "next/image"

import { useRef, useContext, useEffect, useState, useMemo } from 'react'
import { useIsVisible } from 'react-is-visible'
import { FiMapPin, FiSearch, FiPhone, FiShoppingCart, FiMap, FiX, FiChevronDown, FiNavigation, FiCheckCircle } from 'react-icons/fi'

import { NavbarContext } from '../context/NavbarContext'
import { pharmacyData }  from '@/constants/fharmacy'
import { Desktop, Mobile } from '@/components/responsive'
import HeadMeta from '@/components/HeadMeta'

// --- Data Static ---
const onlineStores = [
  { name: "Tokopedia", logo: "/find-us/tokopedia-logo.png", url: "https://www.tokopedia.com/norvineid" },
  { name: "Shopee", logo: "/find-us/shopee-logo.png", url: "https://shopee.co.id/norvineofficial" },
  { name: "TikTok Shop", logo: "/find-us/tiktok-logo.png", url: "https://www.tiktok.com/@norvineofficial" },
]


type PharmacyCity = keyof typeof pharmacyData;

export default function FindUsLanding() {
  const nodeRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const { setActiveScene } = useContext(NavbarContext)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showMapModal, setShowMapModal] = useState<string | null>(null)
  const [openCities, setOpenCities] = useState<PharmacyCity[]>([]);

  useEffect(() => {
    if (isVisible) setActiveScene('partOfUs')
  }, [isVisible, setActiveScene])

  const filteredData = useMemo(() => {
    if (!searchQuery) return pharmacyData;
    const filtered: any = {};
    Object.entries(pharmacyData).forEach(([city, pharmacies]) => {
      const matched = pharmacies.filter(p => 
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.alamat.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (city.toLowerCase().includes(searchQuery.toLowerCase()) || matched.length > 0) {
        filtered[city] = matched.length > 0 ? matched : pharmacies;
      }
    });
    return filtered;
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setOpenCities(Object.keys(filteredData) as PharmacyCity[]);
    } else {
      setOpenCities([]); 
    }
  }, [searchQuery, filteredData]);

  const toggleCity = (city: PharmacyCity) => {
    setOpenCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  }

  return (
    <>
    <HeadMeta 
    title='Find Us | NORVINE'
    description='Temukan lokasi mitra apotek dan online store resmi Norvine terdekat di kota Anda. Dapatkan produk Norvine asli dan terjamin kualitasnya.'
    keywords=''
    />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- MODAL PETA GLOBAL (DIPERBAIKI) --- */}
      {showMapModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full h-full md:h-[80vh] md:max-w-4xl md:rounded-xl overflow-hidden flex flex-col shadow-2xl animate-in md:zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-100 bg-white shadow-sm z-10">
              <div className="flex items-center space-x-3 overflow-hidden pr-4">
                <div className="bg-slate-100 p-2 rounded-full shrink-0">
                  <FiMapPin className="text-slate-700" size={18} />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">
                  {showMapModal.split(',')[0]}
                </h3>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showMapModal)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-wider px-3 md:px-4 py-2.5 hover:bg-black active:scale-95 transition-all rounded-md"
                >
                  <FiNavigation size={12} /> <span className="hidden sm:inline">BUKA DI APP</span>
                  <span className="sm:hidden">APP</span>
                </a>
                <button 
                  onClick={() => setShowMapModal(null)}
                  className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-500 active:scale-95 transition-all rounded-md"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-100 relative">
              {/* Perbaikan URL Embed Maps */}
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(showMapModal)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                className="absolute inset-0 transition-all duration-500"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* --- DESKTOP VIEW --- */}
      <Desktop>
        <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900 flex flex-col pt-8 pb-16">
          <div className="relative z-10 max-w-[1200px] mx-auto w-full px-12">
            
            <header className="mb-12 text-center">
              <h1 ref={nodeRef} className="text-5xl md:text-6xl font-light tracking-[0.1em] mb-3">
                FIND YOUR <span className="font-bold text-slate-900">NORVINE</span>
              </h1>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500 font-medium">
                And settle your way for a healthier you
              </p>
            </header>

            {/* --- SECTION 1: ONLINE STORE --- */}
            <section className="mb-12 flex flex-col items-center">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <FiShoppingCart size={22} className="text-slate-800" />
                  <h2 className="text-xl font-bold tracking-widest uppercase text-slate-800">NORVINE Online Store</h2>
                </div>
                <p className="text-base text-slate-500 max-w-xl leading-relaxed">
                  Dapatkan produk Norvine yang asli dan terjamin kualitasnya melalui official store kami di berbagai platform e-commerce terkemuka.
                </p>
              </div>
              
              <div className="flex justify-center gap-6">
                {onlineStores.map((store) => (
                  <a 
                    key={store.name} 
                    href={store.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center w-48 h-28 bg-white border border-slate-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300"
                  >
                    <div className="relative h-10 w-28 mb-3">
                      <Image src={store.logo} alt={store.name} fill={true} className="object-contain" priority />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shop Now</span>
                  </a>
                ))}
              </div>
            </section>

            <div className="w-full h-[1px] bg-slate-200 my-4"></div>

            {/* --- SECTION 2: MITRA APOTEK NORVINE --- */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <FiMap size={24} className="text-slate-800" />
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Mitra Apotek Norvine</h2>
                    <p className="text-sm text-slate-500 mt-1">Daftar lengkap apotek yang menyediakan produk kami</p>
                  </div>
                </div>

                <div className="relative w-80">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari Kota atau Apotek..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {Object.keys(filteredData).length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 border-dashed">
                   <FiSearch size={32} className="mb-4 opacity-50" />
                   <p className="text-base font-medium">Tidak ada apotek yang sesuai.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {(Object.keys(filteredData) as PharmacyCity[]).map((city) => {
                    const isOpen = openCities.includes(city);
                    
                    return (
                      <div key={city} className="bg-white border border-slate-200 overflow-hidden shadow-sm transition-all">
                        
                        <button 
                          onClick={() => toggleCity(city)}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isOpen ? 'bg-slate-900 text-white border-b border-slate-100' : 'hover:bg-slate-100 '}`}
                        >
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-semibold uppercase tracking-wider ${isOpen ? 'text-white' : 'text-slate-800 hover:text-slate-600'}`}>
                              {city}
                            </h3>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-md ${isOpen ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {filteredData[city].length} Apotek
                            </span>
                          </div>
                          
                          <FiChevronDown 
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-white/80' : 'text-slate-400'}`} 
                            size={20} 
                          />
                        </button>

                        {isOpen && (
                          <div className="p-2 animate-in fade-in slide-in-from-top-1 duration-200 bg-neutral-100">
                            <div className="grid grid-cols-3 gap-2">
                              {filteredData[city].map((item: any, idx: number) => {
                                const mapQuery = `${item.nama}, ${item.g_adress}, ${city}`;
                                return (
                                  <div 
                                    key={idx}
                                    className="bg-white border border-slate-200 py-4 px-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between group"
                                  >
                                    <div className="flex-1 min-w-0 pr-4">
                                      <h4 className="font-semibold text-slate-800 text-base truncate">{item.nama}</h4>
                                      <p className="text-sm text-slate-500 truncate mt-1 flex items-center gap-1.5">
                                        <FiMapPin size={12} className="shrink-0 text-slate-400" />
                                        <span className="truncate">{item.alamat}</span>
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
<div className="relative group">
  <a 
    href={`tel:${item.cp}`}
    className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-600 border border-slate-200 flex items-center justify-center transition-all duration-200"
  >
    <FiPhone size={16} />
  </a>
  
  {/* Tooltip Nomor Telepon */}
  <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold tracking-wide rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-20 scale-95 group-hover:scale-100 origin-bottom">
    {item.cp}
    
    {/* Panah (Arrow) Tooltip di bawah */}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-[1px]"></div>
  </div>
</div>
                                      <button 
                                        onClick={() => setShowMapModal(mapQuery)}
                                        className="w-10 h-10 rounded-full bg-slate-800 hover:bg-black text-white flex items-center justify-center shadow-sm transition-colors"
                                        title="Lihat Peta"
                                      >
                                        <FiMap size={16} />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </Desktop>

      {/* --- MOBILE VIEW --- */}
      <Mobile>
        <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900 pt-8 pb-20">
          
          <header className="px-5 mb-8 text-center">
            <h1 className="text-3xl font-light tracking-[0.05em] mb-2 text-slate-900">
              FIND <span className="font-bold">NORVINE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
              And settle your way for a healthier you
            </p>
          </header>

          {/* Section 1: Online Store Mobile */}
          <div className="px-5 mb-8 text-center">
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-800 mb-2 flex items-center justify-center gap-2">
              <FiShoppingCart size={16} /> ONLINE STORE
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-5 px-2">
              Dapatkan produk Norvine yang asli melalui official store kami.
            </p>
            
            <div className="flex justify-center gap-3 flex-wrap">
              {onlineStores.map((store) => (
                <a 
                  key={store.name} 
                  href={store.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-[30%] min-w-[100px] h-24 bg-white rounded-xl flex flex-col items-center justify-center border border-slate-200 shadow-sm active:scale-95 active:bg-slate-50 transition-all"
                >
                  <div className="relative h-8 w-16 mb-2">
                    <Image src={store.logo} alt={store.name} fill className="object-contain"  />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Shop Now</span>
                </a>
              ))}
            </div>
          </div>

          <div className="px-5 mb-6">
            <div className="w-full h-[1px] bg-slate-200"></div>
          </div>

          {/* Section 2: Mitra Apotek Norvine Mobile - LEBIH KOMPLEKS */}
          <div className="px-5">
            {/* Sticky Search Bar area */}
            <div className="sticky top-[64px] z-20 bg-[#FAFAFA] pt-2 pb-4 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.05)]">
              <h2 className="text-sm font-bold tracking-widest uppercase text-slate-800 mb-3 flex items-center gap-2">
                <FiMap size={16} /> MITRA APOTEK
              </h2>
              
              <div className="relative overflow-hidden group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari Kota atau Nama Apotek..." 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-sm shadow-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all rounded-xl"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {Object.keys(filteredData).length === 0 ? (
               <div className="py-12 mt-2 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 border-dashed rounded-xl">
                 <FiSearch size={28} className="mb-3 opacity-30" />
                 <p className="text-sm font-medium">Pencarian tidak ditemukan.</p>
               </div>
            ) : (
              <div className="space-y-3 mt-2">
                {(Object.keys(filteredData) as PharmacyCity[]).map((city) => {
                  const isOpen = openCities.includes(city);
                  
                  return (
                    <div key={city} className={`bg-white border shadow-sm rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-slate-400' : 'border-slate-200'}`}>
                      
                      <button 
                        onClick={() => toggleCity(city)}
                        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${isOpen ? 'bg-slate-900 text-white' : 'bg-white active:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <h3 className={`text-sm font-bold uppercase tracking-wider ${isOpen ? 'text-white' : 'text-slate-800'}`}>{city}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isOpen ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {filteredData[city].length} Mitra
                          </span>
                        </div>
                        
                        <FiChevronDown 
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} 
                          size={18} 
                        />
                      </button>

                      {/* Konten Accordion Mobile */}
                      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <div className="p-3 sm:p-4 bg-slate-50 flex flex-col gap-3">
                            {filteredData[city].map((item: any, idx: number) => {
                              const mapQuery = `${item.nama}, ${item.g_adress}, ${city}`;
                              return (
                                <div key={idx} className="bg-white p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                                  
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-slate-800 leading-tight pr-2">{item.nama}</h4>
                                  </div>
                                  
                                  <div className="flex items-start gap-2 text-slate-500 mb-5">
                                    <FiMapPin size={14} className="shrink-0 mt-0.5" />
                                    <p className="text-xs leading-relaxed line-clamp-2">{item.alamat}</p>
                                  </div>
                                  
                                  {/* Tombol Aksi Split Lebih Modern */}
                                  <div className="flex gap-2">
                                    <a 
                                      href={`tel:${item.cp}`} 
                                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold active:bg-slate-50 active:scale-[0.98] transition-all"
                                    >
                                      <FiPhone size={14} className="text-slate-400" /> <span className="tracking-wide">Telepon</span>
                                    </a>
                                    <button 
                                      onClick={() => setShowMapModal(mapQuery)}
                                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-md shadow-slate-900/10 active:bg-black active:scale-[0.98] transition-all"
                                    >
                                      <FiMap size={14} className="text-white/80" /> <span className="tracking-wide">Lihat Peta</span>
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Mobile>
    </>
  )
}