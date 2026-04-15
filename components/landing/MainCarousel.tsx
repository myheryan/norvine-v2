import 'react-multi-carousel/lib/styles.css'
import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import Carousel from 'react-multi-carousel'
import Image from "next/image"
import { HiChevronRight } from 'react-icons/hi'
import { BsMouse } from 'react-icons/bs'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import { Mobile, Desktop } from '@/components/responsive'


import CustomArrow from './CustomArrow'

const items = ['banner1', 'banner2', 'banner4', 'banner3'] as const

export default function MainCarousel() {
  // let {  isNavbarWhite } = useContext(NavbarContext)
  const scrollDownRef = useRef(null)
  let [isNavbarWhite, setNavbarWhite] = useState(false)
  const carouselRef = useRef(null)
  const isCarouselVisible = useIsVisible(carouselRef)

  return (
    <div
      ref={carouselRef}
      className="relative h-screen w-full select-none snap-start bg-slate-500"
    >
      <Carousel
        swipeable
        draggable
        responsive={responsive}
        // ssr
        infinite
        autoPlay
        // showDots
        // dotListClass={styles.dotList}
        customTransition="transform 700ms ease-in-out"
        transitionDuration={700}
        autoPlaySpeed={4000}
        customRightArrow={
          <CustomArrow
            direction="right"
            color={isNavbarWhite ? '#FFF' : '#000'}
          />
        }
        customLeftArrow={
          <CustomArrow
            direction="left"
            color={isNavbarWhite ? '#FFF' : '#000'}
          />
        }
        deviceType="desktop"
        beforeChange={(nextSlide) => {
          if (nextSlide === 0 || nextSlide === 3) {
            setNavbarWhite(true)
          } else {
            setNavbarWhite(false)
          }
        }}
      >
        {items.map((item, index) => {
          return renderItem(item, index, scrollDownRef, isCarouselVisible)
        })}
      </Carousel>
      <Desktop>
        <div
          className={`
        absolute bottom-8 ml-[45%]  flex flex-col items-center justify-center ${
          isNavbarWhite ? 'text-[#FFF]' : 'text-[#000]'
        }
        animate-bounce
        transition duration-700
      `}
        >
          <BsMouse
            color={`${isNavbarWhite ? 'text-[#FFF]' : 'text-[#000]'}`}
            size={40}
          />
          <a
            ref={scrollDownRef}
            className={`txt-h5 ${
              isNavbarWhite ? 'text-[#FFF]' : 'text-[#000]'
            } transition duration-700`}
          >
            SCROLL DOWN
          </a>
        </div>
      </Desktop>
    </div>
  )
}

type CarouselItemProps = {
  item: typeof items[number]
  index: number
  scrollDownRef: MutableRefObject<null>
  animationDone?: boolean
}
let CarouselItem = ({
  item,
  index,
  scrollDownRef,
  animationDone,
}: CarouselItemProps) => {
  let { setActiveScene } = useContext(NavbarContext)
  const banner1Ref = useRef(null)
  const banner2Ref = useRef(null)
  const banner3Ref = useRef(null)
  const banner4Ref = useRef(null)
  const isBanner1Visible = useIsVisible(banner1Ref)
  const isBanner2Visible = useIsVisible(banner2Ref)
  const isBanner3Visible = useIsVisible(banner3Ref)
  const isBanner4Visible = useIsVisible(banner4Ref)
  const isScrollVisible = useIsVisible(scrollDownRef)

  useEffect(() => {
    if (isBanner1Visible) {
      setActiveScene('mainCarousel-1')
    }
  }, [isBanner1Visible, isScrollVisible, setActiveScene])
  useEffect(() => {
    if (isBanner2Visible) {
      setActiveScene('mainCarousel-2')
    }
  }, [isBanner2Visible, isScrollVisible, setActiveScene])
  useEffect(() => {
    if (isBanner3Visible) {
      setActiveScene('mainCarousel-3')
    }
  }, [isBanner3Visible, isScrollVisible, setActiveScene])
  useEffect(() => {
    if (isBanner4Visible) {
      setActiveScene('mainCarousel-4')
    }
  }, [isBanner4Visible, isScrollVisible, setActiveScene])
  return (
    <div key={index}>
      <Desktop>
        {item === 'banner1' && (
          <div className="h-screen">
            <div className="absolute -z-50 h-screen w-full ">
              <Image
                src="/landing/banners/banner-1.webp"
                priority
                alt="Landing banner 1"
                fill
                className="object-cover"
                draggable={false}
                unoptimized
              />
            </div>
            <div className="absolute left-[40px] bottom-8 -z-40 h-[6.48%] w-[7.18%]">
              <Image
                src="/landing/banners/made-in-usa.webp"
                fill
                className="object-contain"
                draggable={false}
                alt="Made in USA logo"
                unoptimized
              />
            </div>
            <div className="z-50 flex h-screen w-full ">
              <div className="flex-1" />
              <div className="flex flex-1 justify-end">
                <div>
                  <div className="mt-20 h-[116px] w-[592px] 3xl:mt-28 3xl:h-[155px] 3xl:w-[790px]">
                    <Image
                      src="/landing/banners/1st-verification-brand.webp"
                      width={790}
                      height={155}
                      draggable={false}
                      className="h-auto w-full object-cover"
                      alt="1st Indonesian's supplement brand with verification system"
                      unoptimized
                    />
                  </div>
                  <div className="mt-10 flex max-w-[25.7rem] flex-1 flex-col justify-center 3xl:mt-20 3xl:mr-32 3xl:max-w-[34.375rem]">
                    <h1
                      ref={banner1Ref}
                      className="txt-h1 mb-10 text-[3rem] 3xl:text-[3.688rem]"
                    >
                      SETTLE YOUR
                      <br /> WAY FOR HEALTHIER YOU
                    </h1>
                    <p className="txt-h4 mb-4 text-[#1d1e20]">
                      Norvine Supplements
                    </p>
                    <p className="txt-body mb-8 border-l border-l-[#1d1e20] pl-4 text-[#1d1e20]">
                      Beragam pilihan Norvine supplement dapat membantu Anda
                      dalam memilih suplemen kesehatan yang tepat dan sesuai
                      dengan kebutuhan tiap individu.
                      <span className="font-bold">
                        &nbsp;&nbsp; Doing good for health isn&apos;t expensive,
                        it&apos;s priceless!
                      </span>
                    </p>
                    <div className="flex cursor-pointer flex-row items-center justify-end">
                      <Link href="/our-products" scroll className="txt-h5 font-bold">
                        
                          LIHAT PRODUK SELENGKAPNYA
                        
                      </Link>
                      <HiChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {item === 'banner2' && (
          <div className="h-screen">
            <div className="absolute -z-50 h-screen w-full">
              <Image
                src="/landing/banners/banner-2.webp"
                priority
                alt="Landing banner 2"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="z-50 flex h-screen w-full items-end px-18 py-[6.438rem]">
              <div className="h-[12.313rem] w-[25.563rem]">
                <h1 ref={banner2Ref} className="txt-h4 mb-4 text-[#fcfcfc]">
                  Omega-3 Fish Oil
                </h1>
                <p className="txt-h5 mb-8 border-l border-l-[#fcfcfc] pl-4 text-[#fcfcfc]">
                  Norvine Omega-3 Fish Oil 1,000 mg mengandung minyak dari ikan
                  yang ditangkap secara liar dari perairan di Amerika Selatan.
                  Kaya akan Omega-3, terdiri dari EPA dan DHA, yang dapat
                  membantu menjaga kesehatan tubuh sehari-hari serta kesehatan
                  jantung Anda.
                </p>
                <div className="flex cursor-pointer flex-row justify-end">
                  <p className="txt-h5 text-[#fcfcfc]">LIHAT LEBIH LENGKAP</p>
                  <HiChevronRight className="text-[#fcfcfc]" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
        {item === 'banner4' && (
          <div className="relative h-screen">
            <div className="absolute -z-50 h-screen w-full">
              <Image
                src="/landing/banners/banner-4.1.png"
                priority
                alt="Landing banner 4.1 background"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl px-4 sm:px-6">
              <div className="flex w-full flex-col justify-center">

                {/* Title Image */}
                <div className="mb-6 w-[80vw] max-w-md">
                  <Image
                    src="/landing/banners/banner-4.2.png"
                    alt="Care for your hair from the inside out"
                    width={1800}
                    height={830}
                    priority
                    className="h-auto w-full"
                  />
                </div>

                <p ref={banner4Ref} className="max-w-md text-lg sm:text-lg leading-relaxed text-black"style={{fontFamily:'Calibri'}}>
                  Different mechanisms. Complementary benefits.
                  <br />
                  Designed to complement your hair care routine while
                  supporting overall wellness.
                </p>
                <div className="flex cursor-pointer flex-row items-center mt-10 ml-40">
                  <Link
                    href="/our-products"
                    scroll
                    className="text-xl text-black font-bold"
                    style={{fontFamily:'Calibri'}}>
                    
                      LIHAT PRODUK SELENGKAPNYA
                    
                  </Link>
                  <HiChevronRight size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
        {item === 'banner3' && (
          <div className="h-screen">
            <div className="absolute -z-50 h-screen w-full">
              <Image
                src="/landing/banners/banner-3.1.png"
                priority
                alt="Landing banner 3.1 background"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-32 right-0 -z-40 h-28 w-[5.4rem]">
              <Image
                src="/landing/banners/banner-3.2.png"
                priority
                alt="Landing banner 3.2 group elips"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-32 left-0 -z-40 h-24 w-[3rem]">
              <Image
                src="/landing/banners/banner-3.3.png"
                priority
                alt="Landing banner 3.3 elips"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-32 left-40 -z-40 h-10 w-[3.6rem]">
              <Image
                src="/landing/banners/banner-3.4.png"
                priority
                alt="Landing banner 3.4 quotes"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-64 right-40 -z-40 h-10 w-[3.6rem]">
              <Image
                src="/landing/banners/banner-3.5.png"
                priority
                alt="Landing banner 3.5 quotes"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex h-screen w-screen flex-col items-center justify-start space-y-12 px-40 pt-44 text-center">
              <h1 ref={banner3Ref} className="txt-h1 text-[2.5rem] uppercase">
                Today is your{' '}
                <span className="text-[#ec0000]">day to start fresh</span>, to
                eat right, to train hard, to live healthy, to be proud.
              </h1>
              <h2 className="txt-h2 text-[1.5rem]">- Bonnie Pfiester</h2>
            </div>
          </div>
        )}
      </Desktop>
      <Mobile>
        {item === 'banner1' && (
          <div className="h-screen">
            <div
              className={`absolute -z-50 h-screen w-screen scale-100 ${
                !animationDone ? 'scale-110' : ''
              } animate`}
            >
              <Image
                src="/landing/banners/m-banner-1.png"
                priority
                alt="Landing banner 1 mobile"
                fill
                className="object-cover"
                draggable={false}
                unoptimized
              />
            </div>
            <div className="absolute left-4 bottom-[42%] -z-40 h-10 w-20">
              <Image
                src="/landing/banners/made-in-usa.webp"
                fill
                className="object-contain"
                draggable={false}
                alt="Made in USA logo mobile"
                unoptimized
              />
            </div>
            <div className="absolute top-14 right-0 h-20 w-[22rem]">
              <Image
                src="/landing/banners/1st-verification-brand.webp"
                draggable={false}
                fill
                className="object-contain"
                alt="1st Indonesian's supplement brand with verification system mobile"
                unoptimized
              />
            </div>
            <div
              className={`flex h-screen w-full translate-y-0 ${
                !animationDone ? 'translate-y-1/2' : ''
              } animate`}
            >
              <div className="mb-20 flex flex-1 flex-col justify-end px-4">
                <h1 className="txt-h1 mb-4 text-xl text-white">
                  SETTLE YOUR
                  <br /> WAY FOR HEALTHIER YOU
                </h1>
                <p className="txt-h4 mb-4 text-lg text-white">
                  Norvine Supplements
                </p>
                <p className="txt-body mb-4 border-l border-l-white pl-4 text-sm text-white">
                  Beragam pilihan Norvine supplement dapat membantu Anda dalam
                  memilih suplemen kesehatan yang tepat dan sesuai dengan
                  kebutuhan tiap individu.
                  <span className="font-bold">
                    &nbsp;Doing good for health isn&apos;t expensive, it&apos;s
                    priceless!
                  </span>
                </p>
                <div className="flex cursor-pointer flex-row items-center justify-end text-white">
                  <Link
                    href="/our-products"
                    scroll
                    className="txt-h5 text-sm font-bold text-white">
                    
                      LIHAT LEBIH LENGKAP
                    
                  </Link>
                  <HiChevronRight size={24} />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 -z-40 h-9 w-full">
              <Image
                src="/landing/banners/m-banner-bottom.png"
                priority
                alt="bottom banner"
                fill
                draggable={false}
                unoptimized
              />
            </div>
          </div>
        )}
        {item === 'banner2' && (
          <div className="flex h-screen flex-col bg-[#399EA0] pt-24">
            <div className="relative flex flex-1">
              <div className="absolute top-0 z-30 h-16 w-full">
                <Image
                  src="/landing/banners/m-banner-2.2.png"
                  priority
                  alt="OMEGA Text 1"
                  draggable={false}
                  fill
                  unoptimized
                />
              </div>
              <div className="absolute top-0 bottom-0 z-10 my-auto mx-0 h-16 w-full">
                <Image
                  src="/landing/banners/m-banner-2.2.png"
                  priority
                  alt="OMEGA Text 2"
                  draggable={false}
                  fill
                  unoptimized
                />
              </div>
              <div className="absolute bottom-0 z-30 h-16 w-full">
                <Image
                  src="/landing/banners/m-banner-2.2.png"
                  priority
                  alt="OMEGA Text 3"
                  draggable={false}
                  fill
                  unoptimized
                />
              </div>
              <div className="absolute top-10 bottom-0 left-0 right-0 z-20 m-auto h-4/5 w-4/5">
                <Image
                  src="/landing/banners/m-banner-2.1.png"
                  priority
                  alt="Omega fish oil"
                  draggable={false}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div className="flex w-full flex-1">
              <div className="mb-20 flex flex-1 translate-y-0 flex-col justify-end px-4">
                <h1 className="txt-h4 mb-4 text-lg text-white">
                  Omega-3 Fish Oil
                </h1>
                <p className="txt-body mb-4 border-l border-l-white pl-4 text-sm font-bold text-white">
                  Norvine Omega-3 Fish Oil 1,000 mg mengandung minyak dari ikan
                  yang ditangkap secara liar dari perairan di Amerika Selatan.
                  Kaya akan Omega-3, terdiri dari EPA dan DHA, yang dapat
                  membantu menjaga kesehatan tubuh sehari-hari serta kesehatan
                  jantung Anda.
                </p>
                <div className="flex cursor-pointer flex-row items-center justify-end text-white">
                  <p className="txt-h5 text-sm font-bold text-white">
                    LIHAT LEBIH LENGKAP
                  </p>
                  <HiChevronRight size={24} />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 h-9 w-full">
              <Image
                src="/landing/banners/m-banner-bottom.png"
                priority
                alt="bottom banner"
                fill
                draggable={false}
                unoptimized
              />
            </div>
          </div>
        )}
        {item === 'banner4' && (
          <div className="min-h-screen">
            <div
              className={`absolute -z-50 min-h-screen w-screen scale-100 ${
                !animationDone ? 'scale-110' : ''
              } animate`}
            >
              <Image
                src="/landing/banners/m-banner-4.1.png"
                priority
                alt="Landing banner 4 mobile"
                fill
                className="object-cover"
                draggable={false}
                unoptimized
              />
            </div>
        
            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
              <div className="w-[260px] mt-[17vh] ml-[1vw]">
                <Image
                  src="/landing/banners/m-banner-4.2.png"
                  alt="Care for your hair from the inside out"
                  width={260}
                  height={110}
                  priority
                />
              </div>

              <p className="mt-[1vh] max-w-md text-black text-sm ml-[3vw] pr-[13vw] leading-tight" style={{fontFamily:"Calibri"}}>
                Different mechanisms. Complementary benefits. Designed to
                complement your hair care routine while supporting overall
                wellness.
              </p>

              <div className="flex mt-[1vh] cursor-pointer flex-row items-center justify-end text-black mr-[7vw]">
                <Link
                  href="/our-products?category=hair-care"
                  scroll
                  className="txt-h5 font-bold text-sm text-black"
                  style={{fontFamily:'Calibri'}}>
                   
                    LIHAT PRODUK SELENGKAPNYA
                  
                 </Link>
                <HiChevronRight size={24} />
              </div>

            </div>
            
            <div className="absolute bottom-0 -z-40 h-9 w-full">
              <Image
                src="/landing/banners/m-banner-bottom.png"
                priority
                alt="bottom banner"
                fill
                draggable={false}
                unoptimized
              />
            </div>
          </div>
        )}
        {item === 'banner3' && (
          <div className="h-screen">
            <div className="absolute -z-50 h-screen w-full">
              <Image
                src="/landing/banners/m-banner-3.1.png"
                priority
                alt="Landing banner 3.1 background"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-16 -right-5 -z-40 h-28 w-[5.4rem] scale-50">
              <Image
                src="/landing/banners/banner-3.2.png"
                priority
                alt="Landing banner 3.2 group elips"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-72 -left-4 -z-40 h-24 w-[3rem] scale-50">
              <Image
                src="/landing/banners/banner-3.3.png"
                priority
                alt="Landing banner 3.3 elips"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-48 left-10 -z-40 h-10 w-[3.6rem] scale-50">
              <Image
                src="/landing/banners/banner-3.4.png"
                priority
                alt="Landing banner 3.4 quotes"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-80 right-10 -z-40 h-10 w-[3.6rem] scale-50">
              <Image
                src="/landing/banners/banner-3.5.png"
                priority
                alt="Landing banner 3.5 quotes"
                draggable={false}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex h-screen w-screen flex-col items-center justify-start space-y-4 px-4 pt-56 text-center">
              <h2 className="txt-mobile-h2 text-[1.3rem] uppercase">
                Today is your{' '}
                <span className="text-[#ec0000]">
                  day to start
                  <br /> fresh
                </span>
                , to eat right, to train
                <br /> hard, to live healthy, to be proud.
              </h2>
              <h3 className="txt-mobile-h3 text-[1rem]">- Bonnie Pfiester</h3>
            </div>
          </div>
        )}
      </Mobile>
    </div>
  );
}

let renderItem = (
  item: typeof items[number],
  index: number,
  scrollDownRef: MutableRefObject<null>,
  animationDone: boolean
) => {
  return (
    <CarouselItem
      key={index}
      item={item}
      index={index}
      scrollDownRef={scrollDownRef}
      animationDone={animationDone}
    />
  )
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
}
