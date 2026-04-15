import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from "next/image"

import { useRef, useContext, useEffect } from 'react'
import { FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from './context/NavbarContext'
import { NorvineLogo } from './icons'
import { Mobile, Desktop } from './responsive'

export default function Footer() {
  let router = useRouter()
  const nodeRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  let { setActiveScene } = useContext(NavbarContext)

  useEffect(() => {
    if (isVisible && (router.route === '/' || router.route === '/verify')) {
      setActiveScene('footer')
    }
  }, [isVisible, setActiveScene, router.route])
  return (
    <>
      <Desktop>
        <div className="flex snap-start flex-col bg-[#1D1E20] px-32 pt-16">
          <div className="mb-16 flex flex-row border-b border-[#777777] border-opacity-50 pb-16">
            <div className="flex flex-1 flex-row justify-between">
              <div>
                <div className="mb-8">
                  <Image
                    src="/norvine-logo.png"
                    alt="footer-norvine-logo"
                    width={167}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-row space-x-8 px-2">
                  <FiInstagram size={24} color="#FCFCFC" />
                  <FiFacebook size={24} color="#FCFCFC" />
                  <FiLinkedin size={24} color="#FCFCFC" />
                </div>
              </div>
              <div className="txt-body flex flex-col space-y-8 text-[#FCFCFC]">
                <Link href="/our-products" ref={nodeRef}>
                  Our products
                </Link>
                <Link href="/verify">
                  Products verification
                </Link>
                <Link href="/promo">
                  Promo
                </Link>
                <Link href="/find-us">
                  Find us
                </Link>
                <Link href="/">
                  Contact us
                </Link>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-end">
              <div>
                <p className="txt-body mb-4 font-bold text-[#FCFCFC]">
                  Subscribe to our newsletter!
                </p>
                <div className="mb-8 flex w-[26.625rem] justify-between overflow-hidden rounded-full border border-white">
                  <div className="flex grow px-6 py-4">
                    <input
                      type="text"
                      placeholder="Alamat Email Anda"
                      className="txt-body flex grow bg-transparent text-[#FCFCFC] outline-none"
                    />
                  </div>
                  <button className="bg-[#FCFCFC] pr-6 pl-[0.8rem]">
                    <h5 className="txt-h5 font-bold text-[#1D1E20]">KIRIM</h5>
                  </button>
                </div>
                <div className="txt-body flex flex-col space-y-8 text-[#FCFCFC]">
                  <Link href="/faq">
                    FAQ
                  </Link>
                  <Link href="/refund-policy">
                    Return and Refund Policy
                  </Link>
                  <Link href="/terms-condition">
                    Terms and Condition
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="txt-body mb-16">
            <p className="mb-7 font-bold text-[#FCFCFC]">Disclaimer</p>
            <p className="text-sm text-[#E0E0E0]">
              Kami berusaha untuk memastikan bahwa informasi produk pada situs
              web kami sesuai dengan perkembangan yang ada, namun terkadang
              produsen dapat mengubah daftar bahan mereka. Kemasan dan bahan
              produk yang sebenarnya, mungkin mengandung lebih banyak dan/atau
              informasi yang berbeda dari yang ditampilkan pada situs web kami.
              Semua informasi tentang produk di situs web kami disediakan hanya
              untuk tujuan informasi. Kami menyarankan Anda untuk tidak hanya
              mengandalkan informasi yang disajikan pada situs web kami. Harap
              selalu membaca label, peringatan dan petunjuk yang terdapat pada
              produk sebelum menggunakan atau mengonsumsi suatu produk. Konten
              di situs ini tidak dimaksudkan untuk menggantikan saran yang
              diberikan oleh praktisi medis, apoteker, atau tenaga kesehatan
              profesional berlisensi lainnya. Hubungi penyedia layanan kesehatan
              Anda segera jika Anda menduga bahwa Anda memiliki masalah medis.
              Informasi dan pernyataan tentang produk tidak dimaksudkan untuk
              mendiagnosis, mengobati, menyembuhkan, atau mencegah penyakit atau
              kondisi kesehatan apapun.
            </p>
          </div>
          <div className="txt-body mb-20">
            <p className="text-[#FCFCFC]">© 2026 Norvine</p>
          </div>
        </div>
      </Desktop>
      <Mobile>
        <div className="flex snap-start flex-col space-y-8 bg-[#1D1E20] px-4">
          <div className="flex flex-col border-b border-[#777777] border-opacity-50 pb-8">
            <div className="relative my-8 flex h-12 w-full items-center justify-center">
              <Image
                src="/norvine-logo.png"
                alt="footer-norvine-logo"
                fill
                  className="object-contain"
              />
            </div>

            <div className="my-8 flex flex-row justify-center space-x-8">
              <FiInstagram size={24} color="#FCFCFC" />
              <FiFacebook size={24} color="#FCFCFC" />
              <FiLinkedin size={24} color="#FCFCFC" />
            </div>

            <div className="txt-mobile-body my-8 flex flex-col items-center justify-center space-y-8 text-[#FCFCFC]">
              <Link href="/our-products" ref={nodeRef}>
                Our products
              </Link>
              <Link href="/verify">
                Products verification
              </Link>
              <Link href="/promo">
                Promo
              </Link>
              <Link href="/find-us">
                Find us
              </Link>
              <Link href="/">
                Contact us
              </Link>
            </div>
            <div className="my-8 flex flex-col items-center space-y-4">
              <p className="txt-mobile-body text-[#FCFCFC]">
                Subscribe to our newsletter!
              </p>
              <div className="flex w-full justify-between overflow-hidden rounded-full border border-white">
                <div className="flex grow px-6 py-4">
                  <input
                    type="text"
                    placeholder="Alamat Email Anda"
                    className="txt-mobile-body flex grow bg-transparent text-[#FCFCFC] outline-none"
                  />
                </div>
                <button className="bg-[#FCFCFC] pr-6 pl-[0.8rem]">
                  <h5 className="txt-mobile-h3 font-bold text-[#1D1E20]">
                    KIRIM
                  </h5>
                </button>
              </div>
            </div>

            <div className="txt-mobile-body my-8 flex flex-col items-center justify-center space-y-8 text-[#FCFCFC]">
              <Link href="/faq">
                FAQ
              </Link>
              <Link href="/refund-policy">
                Return and Refund Policy
              </Link>
              <Link href="/terms-condition">
                Terms and Condition
              </Link>
            </div>
          </div>

          <div className="txt-mobile-body flex flex-col items-center space-y-8">
            <p className="text-[#FCFCFC]">Disclaimer</p>

            <div className="text-justify text-sm text-[#E0E0E0]">
              <span id="mobile-footer-main">
                Kami berusaha untuk memastikan bahwa informasi produk pada situs
                web kami sesuai dengan perkembangan yang ada, namun terkadang
                produsen dapat mengubah daftar bahan mereka
              </span>
              <span id="mobile-footer-dots">...</span>
              <span id="mobile-footer-expanded">
                . Kemasan dan bahan produk yang sebenarnya, mungkin mengandung
                lebih banyakdan/atau informasi yang berbeda dari yang
                ditampilkan pada situs web kami. Semua informasi tentang produk
                di situs web kami disediakan hanya untuk tujuan informasi. Kami
                menyarankan Anda untuk tidak hanya mengandalkan informasi yang
                disajikan pada situs web kami. Harap selalu membaca label,
                peringatan dan petunjuk yang terdapat pada produk sebelum
                menggunakan atau mengonsumsi suatu produk. Konten di situs ini
                tidak dimaksudkan untuk menggantikan saran yang diberikan oleh
                praktisi medis, apoteker, atau tenaga kesehatan profesional
                berlisensi lainnya. Hubungi penyedia layanan kesehatan Anda
                segera jika Anda menduga bahwa Anda memiliki masalah medis.
                Informasi dan pernyataan tentang produk tidak dimaksudkan untuk
                mendiagnosis, mengobati, menyembuhkan, atau mencegah penyakit
                atau kondisi kesehatan apapun.
              </span>
              <input type="checkbox" id="mobile-footer-check" />
              <br />
              <label
                id="mobile-footer-read"
                htmlFor="mobile-footer-check"
                className="font-bold text-[#FCFCFC]"
              />
            </div>
          </div>

          <p className="pt-16 pb-8 text-center text-lg text-[#FCFCFC]">
            © 2026 Norvine
          </p>
        </div>
      </Mobile>
    </>
  );
}
