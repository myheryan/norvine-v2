import Image from "next/image"

import { useContext, useEffect, useRef } from 'react'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import { ChevronRight } from '../icons'
import { Mobile, Desktop } from '@/components/responsive'
import NavPlaceHolder from '../NavPlaceHolder'

export default function Overview() {
  const nodeRef = useRef(null)
  const nodeMobileRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const isMobileVisible = useIsVisible(nodeMobileRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible || isMobileVisible) {
      setActiveScene('bestSeller')
    }
  }, [isMobileVisible, isVisible, setActiveScene])
  return (
    <>
      <Desktop>
        <div className="flex h-screen snap-start snap-always flex-row flex-nowrap items-center justify-start bg-[#fcfcfc] px-18 py-32 pb-20">
          <div className="mr-24">
            <h1 ref={nodeRef} className="txt-h1 mb-8">
              MEET OUR <br /> BESTSELLERS
            </h1>
            <h2 className="txt-h2 font-medium text-[#777777]">
              Penuhi kebutuhan suplementasi harian Anda
            </h2>
          </div>
          <div className="flex flex-row space-x-16">
            <div className="mb-8 h-[37.688rem] w-[24.75rem] bg-[#47374f]">
              <div className="mb-[6.25rem] h-[17.75rem] items-center justify-center">
                <Image
                  src={products[0].imgSrc}
                  loading="eager"
                  alt={products[0].title}
                  width={396}
                  height={284}
                  className="h-auto w-full object-cover"
                  draggable={false}
                  
                />
              </div>
              <div className="px-8">
                <h4 className="txt-h4 mb-4 max-w-[15.5rem] text-[#ffffff]">
                  Premium Multivitamin & Mineral Complex
                </h4>
                <h5 className="txt-h5 mb-4 text-[#ffffff]">
                  Mengandung Perpaduan Complete Formula
                </h5>
                <div className="flex flex-row items-center pb-8">
                  <p className="txt-body mr-2 text-[#ffffff]">Isi :</p>
                  <h5 className="txt-h5 rounded-full border border-[#ffffff] px-3 py-1 font-bold text-[#ffffff]">
                    100 kapsul
                  </h5>
                </div>
                <div className="flex cursor-pointer justify-end">
                  <div
                    className="flex cursor-pointer flex-row items-center"
                    onClick={() => {}}
                  >
                    <h5 className="txt-h5 pr-1 pt-[3px] font-bold text-[#ffffff]">
                      LIHAT PRODUK
                    </h5>
                    <div>
                      <ChevronRight />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 h-[37.688rem] w-[24.75rem] bg-[#e97526]">
              <div className="mb-[6.25rem] h-[17.75rem] items-center justify-center">
                <Image
                  src={products[1].imgSrc}
                  loading="eager"
                  alt={products[1].title}
                  width={396}
                  height={284}
                  className="h-auto w-full object-cover"
                  draggable={false}
                  
                />
              </div>
              <div className="px-8">
                <h4 className="txt-h4 mb-4 max-w-[15.5rem] text-[#ffffff]">
                  {products[1].title}
                </h4>
                <h5 className="txt-h5 mb-4 text-[#ffffff]">
                  {products[1].description}
                </h5>

                <div className="flex flex-row items-center pb-8">
                  <p className="txt-body mr-2 text-[#ffffff]">Isi :</p>
                  <div className="flex flex-1 space-x-3">
                    {products[1].quantity.map((quantity) => (
                      <div key={quantity}>
                        <h5 className="txt-h5 rounded-full border border-[#ffffff] px-3 py-1 font-bold text-[#ffffff]">
                          {quantity}
                        </h5>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex cursor-pointer justify-end">
                  <div
                    className="flex cursor-pointer flex-row items-center"
                    onClick={() => {}}
                  >
                    <h5 className="txt-h5 pr-1 pt-[3px] font-bold text-[#ffffff]">
                      LIHAT PRODUK
                    </h5>
                    <div>
                      <ChevronRight />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <NavPlaceHolder />
        <div
          ref={nodeMobileRef}
          className="mb-8 flex h-full w-full snap-start flex-col space-y-8 bg-[#fcfcfc] px-4"
        >
          <div>
            <h1 className="txt-mobile-h1 mb-8">
              MEET OUR <br /> BESTSELLERS
            </h1>
            <h2 className="txt-mobile-body">
              Penuhi kebutuhan suplementasi harian Anda
            </h2>
          </div>

          <div className="flex flex-col space-y-8">
            <MobileCardProduct
              key="purple"
              product={products[0]}
              visible={isMobileVisible}
            />
            <MobileCardProduct
              key="orange"
              product={products[1]}
              visible={isMobileVisible}
            />
          </div>
        </div>
      </Mobile>
    </>
  )
}

type Props = {
  product: typeof products[0]
  visible: boolean
}
function MobileCardProduct({ product, visible }: Props) {
  return (
    <div
      className={`h-[40rem] w-full origin-top py-8 ${
        visible ? 'scale-y-100' : 'scale-y-0'
      } animate ${product.backgroundColor}`}
    >
      <div className="relative h-2/3 w-full">
        <Image
          src={product.imgSrc}
          loading="eager"
          alt={product.title}
          width={300}
          height={300}
          className="object-contain h-auto"
          draggable={false}
          
        />
      </div>
      <div className="px-8">
        <h4 className="txt-h4 mb-4 text-[#ffffff]">{product.title}</h4>
        <h5 className="txt-h5 mb-4 text-[#ffffff]">{product.description}</h5>
        <div className="flex flex-row items-center pb-8">
          <p className="txt-body mr-2 text-[#ffffff]">Isi :</p>
          <div className="flex flex-row space-x-4">
            {product.quantity.map((qty, i) => (
              <h5
                key={i}
                className="txt-h5 rounded-full border border-[#ffffff] px-3 py-1 font-bold text-[#ffffff]"
              >
                {qty}
              </h5>
            ))}
          </div>
        </div>
        <div className="flex cursor-pointer justify-end">
          <div
            className="flex cursor-pointer flex-row items-center"
            onClick={() => {}}
          >
            <h5 className="txt-h5 pr-1 pt-[3px] font-bold text-[#ffffff]">
              LIHAT PRODUK
            </h5>
            <div>
              <ChevronRight />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const products = [
  {
    title: 'Premium Multivitamin & Mineral Complex',
    description: 'Mengandung Perpaduan Complete Formula',
    quantity: ['100 kapsul'],
    redirect: '/product/1',
    imgSrc: '/landing/best-seller-1.webp',
    backgroundColor: 'bg-[#47374f]',
  },
  {
    title: 'C-500mg',
    description: 'Mengandung Bioflavonoid Complex dan Rose Hips',
    quantity: ['60 kapsul', '120 kapsul'],
    redirect: '/product/2',
    imgSrc: '/landing/best-seller-2.webp',
    backgroundColor: 'bg-[#e97526]',
  },
]
