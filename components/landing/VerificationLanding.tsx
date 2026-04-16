import Image from "next/image"

import { useRef, useContext, useEffect } from 'react'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import { Mobile, Desktop } from '@/components/responsive'
import NavPlaceHolder from '../NavPlaceHolder'

const LINK_TILE = [
  'https://www.oecd.org/newsroom/trade-in-fake-goods-is-now-33-of-world-trade-and-rising.htm',
  'https://katadata.co.id/safrezifitra/indepth/613897dced0ea/makin-marak-peredaran-obat-dan-vitamin-palsu-di-masa-pandemi',
  'https://www.who.int/news/item/28-11-2017-1-in-10-medical-products-in-developing-countries-is-substandard-or-falsified',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7337201/#:~:text=The%20United%20States%20Food%20and,including%20Latin%20America%2C%20southeast%20Asia',
]

export default function VerificationLanding() {
  const nodeRef = useRef(null)
  const nodeMobileRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const isMobileVisible = useIsVisible(nodeMobileRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible || isMobileVisible) {
      setActiveScene('verificationLanding')
    }
  }, [isMobileVisible, isVisible, setActiveScene])
  return (
    <>
      <Desktop>
        <div className="min-h-screen snap-start snap-always px-12 pt-[5.25rem] 2xl:px-18">
          <h1 ref={nodeRef} className="txt-h1 mb-8 2xl:mb-18">
            BRAND SUPLEMEN INDONESIA PERTAMA <br /> DENGAN{' '}
            <span className="text-[#EC0000]">SISTEM VERIFIKASI</span>
          </h1>
          <div className="mb-24 flex flex-row justify-around">
            <div className="relative aspect-[726/656] w-[37.812%] select-none hidden lg:block" >
              <Image
                src="/landing/verification.webp"
                alt="verification"
                className="object-contain"
                draggable="false"
                fill
              />
            </div>
            <div>
              <div className="flex">
                <div className="w-[25.75rem] border-b-2 border-r-2 border-[#77777726] pb-6 pr-6 pl-6 2xl:w-[30.75rem] 2xl:pl-14">
                  <h2 className="txt-h2 mb-2 text-[32px] text-[#1D1E20] 2xl:text-[39px]">
                    1
                  </h2>
                  <h3 className="txt-h3 mb-2 text-[20px] text-[#1D1E20] 2xl:text-[23px]">
                    Menurut Organisation for Economic Co-operation and
                    Development (OECD), terdapat{' '}
                    <span className="text-[#EC0000]">
                      <a href={LINK_TILE[0]}>3,3% produk palsu</a>
                    </span>{' '}
                    dari seluruh perdagangan dunia, dimana produk farmasi
                    memiliki rate 2%, dan terus meningkat.
                  </h3>
                  <p className="txt-body text-[#777777]">
                    <a href={LINK_TILE[0]}>Baca lebih lanjut</a>
                  </p>
                </div>
                <div className="w-[25.75rem] border-b-2 border-[#77777726] pl-6 pr-6 pb-6 2xl:w-[30.75rem] 2xl:pr-14">
                  <h2 className="txt-h2 mb-2 text-[32px] text-[#1D1E20] 2xl:text-[39px]">
                    2
                  </h2>
                  <h3 className="txt-h3 mb-2 text-[20px] text-[#1D1E20] 2xl:text-[23px]">
                    Peredaran{' '}
                    <span className="text-[#EC0000]">
                      <a href={LINK_TILE[1]}>
                        {' '}
                        obat dan vitamin palsu semakin marak di tengah pandemi
                        COVID-19.
                      </a>
                    </span>{' '}
                    Banyak keluhan konsumen di media sosial yang tertipu membeli
                    produk farmasi secara online.
                  </h3>
                  <p className="txt-body text-[#777777]">
                    <a href={LINK_TILE[1]}>Baca lebih lanjut</a>
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="w-[25.75rem] border-r pt-6 pr-6 pl-6 2xl:w-[30.75rem] 2xl:pl-16">
                  <h2 className="txt-h2 mb-2 text-[32px] text-[#1D1E20] 2xl:text-[39px]">
                    3
                  </h2>
                  <h3 className="txt-h3 mb-2 text-[20px] text-[#1D1E20] 2xl:text-[23px]">
                    World Health Organization memperkirakan{' '}
                    <span className="text-[#EC0000]">
                      <a href={LINK_TILE[2]}>
                        1 dari 10 produk medis terindikasi di bawah standar atau
                        di palsukan
                      </a>
                    </span>
                  </h3>
                  <p className="txt-body text-[#777777]">
                    <a href={LINK_TILE[2]}>Baca lebih lanjut</a>
                  </p>
                </div>
                <div className="w-[25.75rem] pr-6 pt-6 pl-6 2xl:w-[30.75rem] 2xl:pr-16">
                  <h2 className="txt-h2 mb-2 text-[32px] text-[#1D1E20] 2xl:text-[39px]">
                    4
                  </h2>
                  <h3 className="txt-h3 mb-2 text-[20px] text-[#1D1E20] 2xl:text-[23px]">
                    U.S FDA melaporkan{' '}
                    <span className="text-[#EC0000]">
                      <a href={LINK_TILE[3]}>
                        terjadi pemalsuan dan kualitas di bawah standar sebesar
                        10-30%
                      </a>
                    </span>{' '}
                    untuk produk kesehatan yang dikonsumsi di negara berkembang
                  </h3>
                  <p className="txt-body mb-2 text-[#777777]">
                    <a href={LINK_TILE[3]}>Baca lebih lanjut</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <NavPlaceHolder />
        <div ref={nodeMobileRef} className="relative min-h-screen px-4">
          <Image
            src="/landing/verification-mobile-bg.png"
            alt="verification-bg"
            className="object-contain"
            draggable={false}
            fill
          />
          <h1 className="txt-mobile-h2 mb-8">
            BRAND SUPLEMEN INDONESIA PERTAMA DENGAN{' '}
            <span className="text-[#EC0000]">SISTEM VERIFIKASI</span>
          </h1>

          <div className="flex flex-col">
            <div
              className={`relative ml-20 h-80 scale-100 ${
                isMobileVisible ? '' : 'scale-0'
              } animate origin-bottom-left`}
            >
              <Image
                src="/landing/verification-mobile.png"
                alt="verification-mobile"
                    className="object-contain"
                draggable={false}
                fill
              />
            </div>
            <p className="txt-mobile-h3 mb-2 mt-8 text-[#1D1E20]">
              Autentikasi produk berguna untuk melindungi konsumen dari pihak -
              pihak yang tidak bertanggung jawab. Pastikan produk yang anda
              dapatkan terdaftar dilaman ini. Jika terjadi kendala dalam
              melakukan proses verifikasi, harap hubungi kami melalui{' '}
              <a
                href="mailto:support@1jayatama.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="text-[#EC0000]">support@1jayatama.com</span>
              </a>
            </p>
          </div>
        </div>
      </Mobile>
    </>
  )
}
