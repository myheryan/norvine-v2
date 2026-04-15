import Image from "next/image"

import { useContext, useEffect, useRef, useState } from 'react'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import NavPlaceHolder from '../NavPlaceHolder'
import { Mobile, Desktop } from '@/components/responsive'


import IngredientPointer from './IngredientPointer'

export default function Composition() {
  const nodeRef = useRef(null)
  const nodeMobileRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const isMobileVisible = useIsVisible(nodeMobileRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible || isMobileVisible) {
      setActiveScene('composition')
    }
  }, [isMobileVisible, isVisible, setActiveScene])
  return (
    <>
      <Desktop>
        <div className="relative z-10 flex h-screen w-full snap-start snap-always">
          <div className="absolute -z-50 h-screen w-full">
            <Image
              src="/landing/composition-background.webp"
              alt="Composition background"
              className="object-cover"
              fill
              draggable={false}
              
            />
          </div>
          <div className="absolute h-screen w-[729px]">
            <div className="absolute right-0 top-[30%] z-10 mr-[30%] flex">
              <IngredientPointer
                direction="left"
                anchorClassName="absolute right-0 top-[23%] z-10 mr-[4%] flex"
                text={
                  <h4 className="txt-h4 -mt-1 mr-2 text-[#FCFCFC]">
                    Antioxidant Support
                  </h4>
                }
              />
            </div>
            <div className="absolute right-0 top-[45%] z-10 mr-[40%] flex">
              <IngredientPointer
                direction="left"
                anchorClassName="absolute right-0 top-[23%] z-10 mr-[4%] flex"
                text={
                  <h4 className="txt-h4 -mt-1 mr-2 text-right text-[#FCFCFC]">
                    Fruits and <br /> Vegetable Blend
                  </h4>
                }
              />
            </div>
            <div className="absolute right-0 top-[40%] z-10 -mr-[20%] flex">
              <IngredientPointer
                direction="right"
                anchorClassName="absolute left-0 top-[23%] z-10 -ml-[2%] flex"
                text={
                  <h4 className="txt-h4 -mt-1 ml-2 text-left text-[#FCFCFC]">
                    Gelatine capsule <br /> with chlorophyll
                  </h4>
                }
              />
            </div>
            <div className="absolute right-0 top-[60%] z-10 -mr-[10%] flex">
              <IngredientPointer
                direction="right"
                anchorClassName="absolute left-0 top-[23%] z-10 -ml-[2%] flex"
                text={
                  <h4 className="txt-h4 -mt-1 ml-2  text-left text-[#FCFCFC]">
                    Panax Ginseng <br /> root extract
                  </h4>
                }
              />
            </div>
            <div className="absolute left-0 -top-[6rem] h-full w-full xl:-top-[10rem] 3xl:-top-[0rem]">
              <Image
                src="/landing/composition-hand.webp"
                alt="Composition background"
                width={729}
                height={1080}
                className="h-auto w-full object-cover"
                draggable={false}
                
              />
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="flex flex-1 items-center justify-end pr-8">
            <div className="flex flex-col">
              <h1
                ref={nodeRef}
                className="txt-h1 mb-[3.1875rem] max-w-[53.5rem] text-[3rem] text-[#FCFCFC] 3xl:text-[3.688rem]"
              >
                MELENGKAPI <br /> SUPLEMENTASI VITAMIN
                <br /> DAN MINERAL HARIAN
              </h1>
              <h3 className="txt-h3 mb-2 text-[#FCFCFC]">KOMPOSISI BAHAN</h3>
              <h5 className="txt-h5 mb-8 text-[#FCFCFC]">
                *Berdasarkan total active ingredients
              </h5>
              <div className="flex max-w-[43.93rem] flex-1 flex-col space-y-4">
                {compositions.map(({ name, percentage }) => (
                  <div
                    key={name}
                    className="flex flex-1 items-center justify-between space-x-4"
                  >
                    <span className="txt-body text-[#FCFCFC]">{name}</span>
                    <div className="h-[1px] flex-1 border-b border-dashed border-[#FCFCFC]" />
                    <span className="txt-body text-[#FCFCFC]">
                      {percentage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <NavPlaceHolder />
        <div className="relative z-10 flex h-screen w-full" ref={nodeMobileRef}>
          <div className="absolute -z-50 h-screen w-full">
            <Image
              src="/landing/composition-background.webp"
              alt="Composition background"
              fill
              className="object-cover"
              draggable={false}
              
            />
          </div>

          <div className="absolute h-screen w-[362px]">
            <div
              className={` opacity-100 ${
                isMobileVisible ? '' : 'opacity-0'
              } animate delay-700`}
            >
              <div className="absolute right-0 top-[5%] z-10 mr-[43%] flex">
                <IngredientPointer
                  direction="left"
                  anchorClassName="absolute right-0 top-[23%] z-10 mr-[4%] flex"
                  text={
                    <h4 className="txt-mobile-h4 -mt-1 mr-1 max-w-[3rem] text-[#FCFCFC]">
                      Antioxidant Support
                    </h4>
                  }
                />
              </div>
              <div className="absolute right-0 top-[14%] z-10 mr-[52%] flex">
                <IngredientPointer
                  direction="left"
                  anchorClassName="absolute right-0 top-[23%] z-10 mr-[4%] flex"
                  text={
                    <h4 className="txt-mobile-h4 -mt-1 -mr-4 text-right text-[#FCFCFC]">
                      Fruits and <br /> Vegetable Blend
                    </h4>
                  }
                />
              </div>
              <div className="absolute right-0 top-[10%] z-10 -mr-[2%] flex">
                <IngredientPointer
                  direction="right"
                  anchorClassName="absolute left-0 top-[23%] z-10 -ml-[2%] flex"
                  text={
                    <h4 className="txt-mobile-h4 -mt-1 -ml-8 text-left text-[#FCFCFC]">
                      Gelatine capsule <br /> with chlorophyll
                    </h4>
                  }
                />
              </div>
              <div className="absolute right-0 top-[22%] z-10 mr-[14%] flex">
                <IngredientPointer
                  direction="right"
                  anchorClassName="absolute left-0 top-[23%] z-10 -ml-[2%] flex"
                  text={
                    <h4 className="txt-mobile-h4 -mt-1 -ml-8 max-w-[3rem] text-left text-[#FCFCFC]">
                      Panax Ginseng <br /> root extract
                    </h4>
                  }
                />
              </div>
            </div>
            <div
              className={`translate-x-0 ${
                isMobileVisible ? '' : '-translate-x-full'
              } animate`}
            >
              <div className="absolute left-0 -top-[6rem] -ml-10 h-full w-full">
                <Image
                  src="/landing/composition-hand.webp"
                  alt="Composition background"
                  width={362}
                  height={540}
                  className="h-auto w-full object-cover"
                  draggable={false}
                  
                />
              </div>
            </div>
          </div>
          <div className="mt-[50%] flex w-full flex-1 items-center justify-center px-4">
            <div
              className={`flex w-full translate-y-0 flex-col ${
                isMobileVisible ? '' : 'translate-y-full opacity-0'
              } animate`}
            >
              <h1 className="txt-mobile-h1 mb-[3.1875rem] text-[#FCFCFC]">
                MELENGKAPI <br /> SUPLEMENTASI VITAMIN
                <br /> DAN MINERAL HARIAN
              </h1>
              <h3 className="txt-mobile-h3 mb-2 text-[#FCFCFC]">
                KOMPOSISI BAHAN
              </h3>
              <h5 className="txt-mobile-h5 mb-8 text-[#FCFCFC]">
                *Berdasarkan total active ingredients
              </h5>
              <div className="flex flex-1 flex-col space-y-4">
                {compositions.map(({ name, percentage }) => (
                  <div
                    key={name}
                    className="flex flex-1 items-center justify-between space-x-4"
                  >
                    <span className="txt-mobile-body text-[#FCFCFC]">
                      {name}
                    </span>
                    <div className="h-[1px] flex-1 border-b border-dashed border-[#FCFCFC]" />
                    <span className="txt-mobile-body text-[#FCFCFC]">
                      {percentage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Mobile>
    </>
  )
}

const compositions = [
  {
    name: 'Multivitamin',
    percentage: '49.9%',
  },
  {
    name: 'Mineral',
    percentage: '45.3%',
  },
  {
    name: 'Antioxidant component',
    percentage: '3%',
  },
  {
    name: 'Herbal extract',
    percentage: '0.9%',
  },
  {
    name: '42 Fruits and vegetable blend',
    percentage: '0.9%',
  },
]
