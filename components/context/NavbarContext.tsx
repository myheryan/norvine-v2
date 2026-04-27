'use client' // WAJIB untuk Context di App Router

import { createContext, useState, ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Props = {
  children: ReactNode
}


type LandingComponents =
  | 'mainCarousel-1'
  | 'mainCarousel-2'
  | 'mainCarousel-3'
  | 'mainCarousel-4'
  | 'overview'
  | 'bestSeller'
  | 'composition'
  | 'chooseSupplement'
  | 'verificationLanding'
  | 'partOfUs'
  | 'instagram'
  | 'contactUs'
  | 'footer'
  | ''

type Context = {
  isNavbarWhite: boolean
  activeScene: LandingComponents
  setNavbarWhite: (flag: boolean) => void
  setActiveScene: (scene: LandingComponents) => void
}

export const NavbarContext = createContext<Context>({
  isNavbarWhite: false,
  activeScene: '',
  setNavbarWhite: (_flag: boolean) => {},
  setActiveScene: () => {},
})

// Mapping warna navbar berdasarkan scene
const isNavbarWhiteByActiveScene: Record<LandingComponents, boolean> = {
  '': false,
  'mainCarousel-1': false,
  'mainCarousel-2': true,
  'mainCarousel-3': false,
  'mainCarousel-4': false,
  overview: false,
  bestSeller: false,
  composition: true,
  chooseSupplement: true,
  verificationLanding: false,
  partOfUs: true,
  instagram: false,
  contactUs: false,
  footer: true,
}

export default function NavbarProvider({ children }: Props) {
  const [isNavbarWhiteState, setNavbarWhiteState] = useState(false)
  const [activeScene, setActiveScene] = useState<LandingComponents>('')
  
  const pathname = usePathname()

  const setNavbarWhite = (flag: boolean) => {
    setNavbarWhiteState(flag)
  }

  useEffect(() => {
    if (pathname !== '/' && isNavbarWhiteState) {
      setNavbarWhiteState(false)
    }
  }, [pathname, isNavbarWhiteState])

  const isNavbarWhite = pathname === '/' 
    ? isNavbarWhiteByActiveScene[activeScene] 
    : isNavbarWhiteState

  return (
    <NavbarContext.Provider
      value={{
        isNavbarWhite,
        activeScene,
        setNavbarWhite,
        setActiveScene,
      }}
    >
      {children}
    </NavbarContext.Provider>
  )
}
