import { useContext, useEffect, useRef } from 'react'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import { America, GMO, NoPork, Vegan } from '../icons'
import { Mobile, Desktop } from '@/components/responsive'

import NavPlaceHolder from '../NavPlaceHolder'
import Head from "next/head";

export default function Overview() {
  const nodeRef = useRef(null)
  const nodeMobileRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const isMobileVisible = useIsVisible(nodeMobileRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible || isMobileVisible) {
      setActiveScene('overview')
    }
  }, [isMobileVisible, isVisible, setActiveScene])
  return (
    <>
      <Head>
        <meta name="google-site-verification" content="Y1bMp9Qt8CxA0kV7U6YLXYHL89Ijv9gEkrLJYDwp8Do" />
      </Head>
      <Desktop>
        <div className="snap-start snap-always bg-[#fcfcfc] px-4 pt-48 pb-20 xl:px-18">
          <div ref={nodeRef} className="flex-column mb-32 flex">
            <h2 className="txt-h2 flex-1 text-[#ec0000]">OVERVIEW</h2>
            <p className="txt-body max-w-6xl flex-[2] text-justify">
              Suplemen kesehatan untuk imunitas tubuh, tulang, persendian,
              jantung, otak dan kulit. Diformulasikan dengan bahan baku terbaik
              dari seluruh dunia, Norvine keeping you complemented.
            </p>
          </div>
          <div className="grid gap-18 xl:grid-cols-6 2xl:grid-cols-10">
            <h2 className="txt-h2 col-span-2 row-span-2 mr-[11.5rem] whitespace-nowrap">
              WHY US
            </h2>
            {whyUsList.map(({ description, title, icon }) => {
              return (
                <div
                  className="col-span-2 max-w-[20.6rem] xl:max-w-[19rem]"
                  key={title}
                >
                  <div className="mb-10 h-[9.75rem] w-[9.75rem] ">{icon}</div>
                  <h3 className="txt-h3 mb-10 text-[#1d1e20]">{title}</h3>
                  <p className="txt-body">{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Desktop>

      <Mobile>
        <NavPlaceHolder />
        <div ref={nodeMobileRef} className="bg-[#fcfcfc] px-4 pt-4 pb-12">
          <div className="mb-12 flex flex-col">
            <h2 className="txt-mobile-h2 flex-1 text-[#ec0000]">OVERVIEW</h2>
            <p className="txt-mobile-body max-w-6xl flex-[2] text-justify">
              Suplemen kesehatan untuk imunitas tubuh, tulang, persendian,
              jantung, otak dan kulit. Diformulasikan dengan bahan baku terbaik
              dari seluruh dunia, Norvine keeping you complemented.
            </p>
          </div>
          <div className="flex flex-col space-y-8">
            <h2 className="txt-mobile-h2 whitespace-nowrap">WHY US</h2>
            {whyUsList.map(
              ({ description, title, iconMobile: Icon, animationDelay }, i) => {
                return (
                  <div
                    className={`flex translate-x-0 flex-row space-x-4 ${
                      isMobileVisible ? '' : '-translate-x-full'
                    } animate ${animationDelay}`}
                    key={title}
                  >
                    <div className="flex-[1]">
                      <Icon size="102" />
                    </div>
                    <div className="flex-[3]">
                      <h3 className="txt-mobile-h2 text-[#1d1e20]">{title}</h3>
                      <p className="txt-mobile-body text-justify">
                        {description}
                      </p>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>
      </Mobile>
    </>
  )
}

const whyUsList = [
  {
    title: 'MADE IN USA',
    description:
      'Norvine Supplement telah melalui beragam tahapan produksi pada fasilitas yang beroperasi sesuai standar GMP (Good Manufacturing Practice) dan telah tersertifikasi oleh FDA (Food and Drug Administration).',
    icon: <America />,
    iconMobile: America,
    animationDelay: 'delay-300',
  },
  {
    title: 'VEGAN',
    description:
      'Produk Norvine Supplement terbuat dari bahan alami dan tidak mengandung bahan-bahan hewani dalam formulasinya, sehingga sebagian produk Norvine Supplement dapat dikonsumsi bagi Vegetarian.',
    icon: <Vegan />,
    iconMobile: Vegan,
    animationDelay: 'delay-500',
  },

  {
    title: 'NON-GMO',
    description:
      'Norvine Supplement sedang mencoba mengembangkan produk-produk dengan menggunakan bahan-bahan yang tidak melalui rekayasa genetik, dan cukup banyak produk telah berhasil dan terbebas dari bahan-bahan GMO (Genetically Modified Organism).',
    icon: <GMO />,
    iconMobile: GMO,
    animationDelay: 'delay-700',
  },
  {
    title: 'PORCINE FREE',
    description:
      'Seluruh produk Norvine tidak mengandung porcine (bahan maupun turunan dari hewan babi), sehingga dapat dikonsumsi semua keluarga Indonesia.',
    icon: <NoPork />,
    iconMobile: NoPork,
    animationDelay: 'delay-1000',
  },
]
