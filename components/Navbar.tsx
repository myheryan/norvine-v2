import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useContext, useEffect, useMemo, useState } from 'react'
import { RiCloseLine, RiSearchLine } from 'react-icons/ri'
import { FiMenu, FiShoppingCart } from 'react-icons/fi'
import { Five, Four, NorvineLogo, One, Three, Two } from './icons'
import { NavbarContext } from './context/NavbarContext'
import { Desktop, Mobile } from './responsive'
import { useCart } from './context/CartContext'
import UserMenu from '@/components/UserMenu'
import { cn } from '@/lib/utils' // Pastikan kamu punya utility cn, atau pakai template literal biasa
import { GiShoppingCart } from 'react-icons/gi'

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

 // Daftar halaman yang membuat tombol naik ke atas
const elevatedPaths = ['/user', '/cart'];

const isUserPage = elevatedPaths.some(path => router.pathname.startsWith(path));

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
      {/* DESKTOP NAVBAR */}
      <Desktop>
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${useSolidBg ? 'bg-[#1D1E20] shadow-lg' : 'bg-transparent'}`}>
          {!searchBarVisible ? (
            <div className="flex h-[72px] items-center justify-between px-16">
              <Link href="/"><NorvineLogo type={getLogoType()} /></Link>
              <div className={`flex items-center space-x-2 text-[13px] font-semibold tracking-[0.1em] ${getTextColor()}`}>
                <div className="flex space-x-6 mr-6">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={`relative py-2 transition-opacity ${router.pathname === link.href ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                      {link.label}
                      {router.pathname === link.href && <span className={`absolute bottom-0 left-0 h-[2px] w-full ${useSolidBg || isNavbarWhite ? 'bg-white' : 'bg-[#1D1E20]'}`} />}
                    </Link>
                  ))}
                </div>
                <button onClick={() => setSearchBarVisible(true)} className="p-2 hover:opacity-70 transition-opacity"><RiSearchLine size={20} /></button>
                
                <Link href="/cart" className="relative p-2 hover:opacity-70 transition-opacity">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">{cartCount}</span>}
                </Link>
                
                <UserMenu textColor={getTextColor()} />
              </div>
            </div>
          ) : (
            <div className="flex h-[72px] items-center justify-between bg-white px-16 shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex-1" />
              <form className="flex w-full max-w-3xl items-center rounded-full bg-slate-100 px-6 py-3" onSubmit={onSubmitSearch}>
                <RiSearchLine size={20} className="text-slate-500" />
                <input autoFocus value={searchValue} placeholder="CARI PRODUK..." className="mx-4 flex-1 bg-transparent text-sm font-semibold outline-none" onChange={(e) => setSearchValue(e.target.value)} />
                <button type="button" onClick={() => setSearchBarVisible(false)}><RiCloseLine size={26} /></button>
              </form>
              <div className="flex-1" />
            </div>
          )}
        </nav>
      </Desktop>

      {/* MOBILE NAVBAR */}
      <Mobile>
        <nav className={`fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-5 transition-all ${useSolidBg ? 'bg-[#1D1E20] text-white shadow-md' : 'bg-transparent text-slate-900'}`}>
          <button onClick={() => setOpenMobileNav(true)}><FiMenu size={24} /></button>
          <Link href="/"><NorvineLogo type={getLogoType()} /></Link>
          <div className="flex items-center">
            <UserMenu textColor={getTextColor()} />
          </div>
        </nav>

        {/* FLOATING CART BUTTON (ORANGE-700) */}
        {/* Menggunakan dynamic class: jika isUserPage, naik 40px (bottom-16), jika tidak (bottom-6) */}
        <Link 
          href="/cart" 
          className={cn(
            "fixed z-[50] flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white shadow-2xl active:scale-90 transition-all duration-300 right-6 shadow-sm shadow-zinc-700",
            isUserPage ? "bottom-[80px]" : "bottom-6" 
          )}
        >
          <GiShoppingCart size={32} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Drawer Mobile Logic */}
        <div className={`fixed inset-0 z-[80] bg-white px-8 py-8 transition-all duration-500 ${!openMobileNav ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'}`}>
           <div className="flex items-center justify-between mb-12">
             <NorvineLogo type="black" />
             <button onClick={() => setOpenMobileNav(false)} className="p-2 bg-slate-100 rounded-full"><RiCloseLine size={24} /></button>
           </div>
           <div className="flex flex-col space-y-6">
             {mobileMenuBars.map((item) => (
               <Link key={item.label} href={item.link} onClick={() => setOpenMobileNav(false)} className="flex items-center justify-between border-b pb-4 text-slate-900 font-bold uppercase tracking-widest text-sm">
                 <div className="flex items-center gap-4">{item.icon} {item.label}</div>
                 <span>→</span>
               </Link>
             ))}
           </div>
        </div>
      </Mobile>
    </>
  );
}