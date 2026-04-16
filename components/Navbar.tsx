import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useContext, useEffect, useMemo, useState } from 'react'
import { RiCloseLine, RiSearchLine } from 'react-icons/ri'
import { FiMenu, FiShoppingCart } from 'react-icons/fi'
import { NorvineLogo, One, Two, Three, Four, Five } from './icons'
import { NavbarContext } from './context/NavbarContext'
import { useCart } from './context/CartContext'
import UserMenu from '@/components/UserMenu'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/our-products', label: 'OUR PRODUCTS' },
  { href: '/verify', label: 'PRODUCTS VERIFICATION' },
  { href: '/promo', label: 'PROMO' },
  { href: '/find-us', label: 'FIND US' },
]

const mobileMenuBars = [
  { icon: <One />, link: '/', label: 'Home' },
  { icon: <Two />, link: '/our-products', label: 'Our Products' },
  { icon: <Three />, link: '/verify', label: 'Product Verification' },
  { icon: <Four />, link: '/promo', label: 'Promo' },
  { icon: <Five />, link: '/find-us', label: 'Find Us' },
]

export default function NavBar() {
  const { isNavbarWhite } = useContext(NavbarContext)
  const router = useRouter()
  const [searchBarVisible, setSearchBarVisible] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [openMobileNav, setOpenMobileNav] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { cartCount } = useCart()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const useSolidBg = useMemo(() => isScrolled || router.pathname !== '/', [router.pathname, isScrolled]);
  const getTextColor = () => (useSolidBg || isNavbarWhite ? 'text-white' : 'text-[#1D1E20]')
  const getLogoType = () => (useSolidBg || isNavbarWhite ? 'white' : 'black')

  const onSubmitSearch = (e: FormEvent<HTMLElement>) => {
    e.preventDefault()
    if (!searchValue.trim()) return
    router.push(`/our-products?search=${encodeURIComponent(searchValue)}`)
    setSearchBarVisible(false)
  }

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        useSolidBg ? "bg-[#1D1E20] py-3 shadow-xl" : "bg-transparent py-5"
      )}>
        {/* Container Utama: Menggunakan justify-between untuk push ke kiri & kanan */}
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-5 md:px-10 lg:px-16">
          
          {/* SISI KIRI: LOGO (Selalu di kiri di semua device) */}
          <div className="flex-shrink-0">
            <Link href="/"><NorvineLogo type={getLogoType()} /></Link>
          </div>

          {/* SISI KANAN: NAVIGASI + ICONS (Sejajar di kanan) */}
          <div className="flex items-center gap-x-2 md:gap-x-6 lg:gap-x-10">
            
            {/* Navigasi Desktop & Tablet (Muncul mulai md) */}
            <div className={cn(
              "hidden md:flex items-center gap-x-4 lg:gap-x-4 text-[10px] lg:text-[14px] font-semibold tracking-[0.1em]",
              getTextColor()
            )}>
              {navLinks.map((link) => {
                const isActive = router.pathname === link.href
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={cn(
                      "relative py-1 transition-all duration-300 whitespace-nowrap",
                      isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className={cn(
                        "absolute -bottom-1 left-0 h-[1.5px] w-full",
                        useSolidBg || isNavbarWhite ? "bg-white" : "bg-[#1D1E20]"
                      )} />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Icons Section (Search, Cart, Profile, Hamburger) */}
            <div className={cn("flex items-center gap-x-1 md:gap-x-3", getTextColor())}>
              
              {/* Search Icon */}
              <button 
                onClick={() => setSearchBarVisible(true)} 
                className="p-2 hover:opacity-60 transition-opacity hidden sm:block"
              >
                <RiSearchLine size={20} />
              </button>
              
              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 hover:opacity-60 transition-opacity">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0 flex h-3.5 w-3.5 items-center justify-center bg-red-600 text-[8px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* User Menu / Avatar */}
              <div className="flex items-center">
                <UserMenu textColor={getTextColor()} />
              </div>

              {/* Hamburger (Hanya Mobile < 768px) */}
              <button 
                onClick={() => setOpenMobileNav(true)} 
                className="md:hidden p-2 ml-1"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        {searchBarVisible && (
          <div className="absolute inset-0 h-full flex items-center justify-center bg-white px-5 md:px-16 animate-in fade-in duration-300">
            <form className="flex w-full max-w-4xl items-center bg-zinc-100 px-6 py-2" onSubmit={onSubmitSearch}>
              <RiSearchLine size={20} className="text-zinc-400" />
              <input 
                autoFocus 
                value={searchValue} 
                placeholder="CARI PRODUK..." 
                className="mx-4 flex-1 bg-transparent text-[11px] font-black tracking-widest outline-none text-zinc-900" 
                onChange={(e) => setSearchValue(e.target.value)} 
              />
              <button type="button" onClick={() => setSearchBarVisible(false)}>
                <RiCloseLine size={26} className="text-zinc-900" />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* MOBILE DRAWER */}
      <div className={cn(
        "fixed inset-0 z-[70] bg-white transition-all duration-500 ease-in-out md:hidden",
        !openMobileNav ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-y-0"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <NorvineLogo type="black" />
          <button onClick={() => setOpenMobileNav(false)} className="p-2 text-zinc-900">
            <RiCloseLine size={28} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {mobileMenuBars.map((item) => (
            <Link 
              key={item.label} 
              href={item.link} 
              onClick={() => setOpenMobileNav(false)} 
              className="flex items-center justify-between border-b border-zinc-50 pb-4 text-zinc-900 font-black uppercase tracking-[0.2em] text-[11px]"
            >
              <div className="flex items-center gap-5">
                <span className="opacity-70">{item.icon}</span>
                {item.label}
              </div>
              <span className="text-zinc-300">→</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}