import 'react-multi-carousel/lib/styles.css'
import React from 'react'
import Carousel from 'react-multi-carousel'
import Image from "next/image"
import classNames from 'classnames'

import CustomArrow from '../landing/CustomArrow'

export default function ProductCarousel({ data }: { data: Array<string> }) {
  // 1. Menggabungkan DotComponents menggunakan Tailwind (h-10 w-10 untuk mobile, md:h-20 md:w-20 untuk desktop)
  let DotComponents = data.map((url) => {
    return (
      <div key={url} className="h-10 w-10 md:h-20 md:w-20 overflow-hidden relative">
        <Image
          src={url}
          height={100}
          width={100}
          alt="product thumbnail"
          className="h-full w-full object-cover"
        />
      </div>
    )
  })

  let CustomDot = ({ index, onClick, active }: any) => {
    return (
      <button
        onClick={(e) => {
          onClick()
          e.preventDefault()
        }}
        className={classNames('custom-dot', {
          'custom-dot--active': active,
        })}
      >
        {React.Children.toArray(DotComponents)[index]}
      </button>
    )
  }

  // 2. Menggabungkan Carousel utama, memanfaatkan class 'md:' untuk layout desktop
  return (
    <div className="h-fit w-full md:h-screen">
      <Carousel
        swipeable
        draggable
        responsive={responsive}
        infinite
        autoPlay
        showDots
        customTransition="transform 700ms ease-in-out"
        transitionDuration={700}
        customRightArrow={<CustomArrow direction="right" color="#000" />}
        customLeftArrow={<CustomArrow direction="left" color="#000" />}
        deviceType="desktop"
        customDot={<CustomDot />}
        ssr
      >
        {data.map((url) => {
          return (
            <div key={url} className="flex h-fit w-full justify-center md:h-screen md:w-screen md:justify-start">
              {/* Margin dan posisi diatur secara responsif */}
              <div className="mb-20 flex select-none self-center md:mb-10 md:ml-[4%]">
                <Image
                  src={url}
                  height={800} // Menggunakan ukuran terbesar sebagai base resolution
                  width={800}
                  alt="product picture"
                  // Membatasi ukuran gambar di desktop menjadi maksimal 595px agar sesuai dengan desain awalmu
                  className="h-auto w-full max-w-[800px] object-contain md:max-w-[595px]"
                />
              </div>
            </div>
          )
        })}
      </Carousel>
    </div>
  )
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
}