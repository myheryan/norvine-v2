// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import client from '@/lib/apollo-client'
import { SessionProvider } from "next-auth/react";
import Layout from '../components/Layout' 
import { CartProvider } from '../components/context/CartContext'
import { Toaster } from 'sonner'
import SessionGuard from '@/components/auth/SessionGuard' // Import guard

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <ApolloProvider client={client}>
          {/* Bungkus di sini agar semua halaman terproteksi */}
          <SessionGuard> 
            <Layout pageProps={pageProps}>
              <Toaster 
                position="top-center"
                toastOptions={{
                  style: { fontFamily: 'var(--font-sans)' },
                }} 
              />
              <Component {...pageProps} />
            </Layout>
          </SessionGuard>
        </ApolloProvider>
      </CartProvider>
    </SessionProvider>
  )
}

export default MyApp