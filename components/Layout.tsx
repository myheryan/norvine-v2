// components/Layout.tsx
import { ReactNode, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import Navbar from './Navbar'
import Footer from './Footer'
import Sidebar from './user/UserSidebar' // Import file baru tadi
import NavbarProvider from './context/NavbarContext'
import { useSession } from 'next-auth/react'

export default function Layout({ children, pageProps }: { children: ReactNode, pageProps: any }) {
  const { data: session, status } = useSession();
  const router = useRouter()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const isUserPage = router.pathname.startsWith('/user')

  useEffect(() => {
    const handleRouteChange = () => {
      if (scrollDivRef.current) {
        scrollDivRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router])

  
  return (
    <NavbarProvider>
      <div
        id="snap-container"
        ref={scrollDivRef}
        className={`h-screen overflow-y-auto bg-white ${
          router.pathname === '/' ? 'snap-y snap-mandatory' : 'pt-16 lg:pt-18'
        }`}
      >
        <Navbar />

        {isUserPage ? (
          /* --- TAMPILAN USER (E-COMMERCE WRAPPER) --- */
          <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto max-w-6xl pb-20">
              <div className="flex flex-col md:flex-row gap-3">
                    <Sidebar user={session?.user} pathname={router.pathname} />
                <main className="flex-1 min-w-0 w-full">
                    {children}
                </main>

              </div>
            </div>
          </div>
        ) : (
          /* --- TAMPILAN PUBLIK --- */
          <>
            <main className="min-h-screen">{children}</main>
            <Footer />
          </>
        )}
      </div>
    </NavbarProvider>
  )
}