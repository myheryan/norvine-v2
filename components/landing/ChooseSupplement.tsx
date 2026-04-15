import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import {
  Arrow,
  Bone,
  Brain,
  GeneralHealth,
  Hair,
  Heart,
  Muscle,
  N,
  Skin,
} from '../icons'
import { Mobile, Desktop } from '@/components/responsive'

import NavPlaceHolder from '../NavPlaceHolder'

export default function ChooseSupplement() {
  const nodeRef = useRef(null)
  const nodeMobileRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const isMobileVisible = useIsVisible(nodeMobileRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible || isMobileVisible) {
      setActiveScene('chooseSupplement')
    }
  }, [isMobileVisible, isVisible, setActiveScene])
  let [activeItem, setActiveItem] = useState<ItemKeys>('general')
  return (
    <>
      <Desktop>
        <div
          ref={nodeRef}
          className="relative flex h-screen w-full snap-start snap-always justify-center bg-[#1D1E20]"
        >
          <div className="absolute -mt-[23.25%] w-[65.79%] border-black 3xl:-mt-[31%] 3xl:w-[82.39%]">
            <div className="absolute h-full w-full">
              {Object.entries(items).map(
                ([
                  key,
                  { description, icon, left, top, iconWhite, redirect },
                ]) => {
                  let active = activeItem === key
                  return (
                    <Link href={`/our-products?category=${redirect}`} key={key}>

                      <div
                        onMouseEnter={() => {
                          setActiveItem(key as ItemKeys)
                        }}
                        className="absolute flex w-[13.96%] flex-col items-center justify-center"
                        style={{ marginTop: top, left }}
                      >
                        <div className="aspect-square w-[43.43%] pb-2">
                          {active ? iconWhite : icon}
                        </div>
                        <h3
                          className={`txt-h3 text-center ${
                            active ? 'text-[#FCFCFC]' : 'text-[#999999]'
                            }`}
                        >
                          {description}
                        </h3>
                      </div>

                    </Link>
                  );
                }
              )}
            </div>
            <div className="absolute left-[11.37%] w-[77.243%]">
              <div className="outer-circle-shadow z-5 relative flex aspect-square w-full flex-col items-center justify-center rounded-full bg-[#1D1E20]">
                <div className="inner-circle-shadow relative z-10 aspect-square w-[34.615%] rounded-full bg-[#1D1E20]">
                  <div
                    className="flex h-full w-full items-center justify-center transition"
                    style={{
                      transform: `rotate(${items[activeItem].degree}deg)`,
                    }}
                  >
                    <div className="h-[41.46%] w-[32.46%]">
                      <N />
                    </div>
                    <div className="absolute top-[165%] aspect-square w-[23.74%] ">
                      <Arrow />
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
          className="h-fit w-full bg-[#1D1E20] py-12 px-8"
        >
          <h2 className="txt-mobile-h3 text-gray-500">PRODUCTS CATEGORY</h2>
          <h1 className="txt-mobile-h2 mb-8 text-white">
            PILIH KEBUTUHAN ANDA
          </h1>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(itemsMobile).map(
              ([key, { description, iconWhite, redirect, delay }]) => {
                return (
                  <Link href={`/our-products?category=${redirect}`} key={key}>

                    <div
                      className={`aspect-square translate-y-0 border border-white px-4 py-2 ${
                        isMobileVisible ? '' : 'translate-y-full opacity-0'
                        } animate ${delay}`}
                    >
                      <div className={`scale-75`}>{iconWhite} </div>

                      <p className="txt-mobile-body text-center text-white">
                        {description}
                      </p>
                    </div>

                  </Link>
                );
              }
            )}
          </div>
        </div>
        <div className="snap-end"></div>
      </Mobile>
    </>
  );
}

// total degree: 140
const items = {
  hair: {
    top: '59.50%',
    left: '90.66%',
    icon: <Hair />,
    iconWhite: <Hair color="#FCFCFC" />,
    description: 'PERAWATAN RAMBUT',
    degree: -60,
    redirect: 'hair-care',
    delay: 'delay-300',
  },
  muscle: {
    top: '74.50%',
    left: '78.11%',
    icon: <Muscle />,
    iconWhite: <Muscle color="#FCFCFC" />,
    description: 'ENERGI & TENAGA',
    degree: -40,
    redirect: 'energy-vitality',
    delay: 'delay-300',
  },
  skin: {
    top: '81.83%',
    left: '60.56%',
    icon: <Skin />,
    iconWhite: <Skin color="#FCFCFC" />,
    description: 'KESEHATAN KULIT',
    degree: -20,
    redirect: 'skin-health',
    delay: 'delay-300',
  },
  brain: {
    top: '87.90%',
    left: '43.01%',
    icon: <Brain />,
    iconWhite: <Brain color="#FCFCFC" />,
    description: 'KESEHATAN OTAK & MEMORI',
    degree: 0,
    redirect: 'brain-health-memory',
    delay: 'delay-500',
  },
  bone: {
    top: '81.83%',
    left: '25.46%',
    icon: <Bone />,
    iconWhite: <Bone color="#FCFCFC" />,
    description: 'TULANG, OTOT, DAN SENDI',
    degree: 20,
    redirect: 'bones-muscles-joints-health',
    delay: 'delay-500',
  },
  heart: {
    top: '74.50%',
    left: '7.91%',
    icon: <Heart />,
    iconWhite: <Heart color="#FCFCFC" />,
    description: 'KESEHATAN JANTUNG',
    degree: 40,
    redirect: 'heart-health',
    delay: 'delay-700',
  },
  general: {
    top: '59.50%',
    left: '-7.64%',
    icon: <GeneralHealth />,
    iconWhite: <GeneralHealth color="#FCFCFC" />,
    description: 'KESEHATAN UMUM',
    redirect: 'general-health',
    degree: 60,
    delay: 'delay-700',
  },
}

const itemsMobile = {
  muscle: {
    icon: <Muscle />,
    iconWhite: <Muscle color="#FCFCFC" />,
    description: 'ENERGI & TENAGA',
    redirect: 'energy-vitality',
    delay: 'delay-300',
  },
  skin: {
    icon: <Skin />,
    iconWhite: <Skin color="#FCFCFC" />,
    description: 'KESEHATAN KULIT',
    redirect: 'skin-health',
    delay: 'delay-300',
  },
  brain: {
    icon: <Brain />,
    iconWhite: <Brain color="#FCFCFC" />,
    description: 'KESEHATAN OTAK & MEMORI',
    redirect: 'brain-health-memory',
    delay: 'delay-500',
  },
  bone: {
    icon: <Bone />,
    iconWhite: <Bone color="#FCFCFC" />,
    description: 'TULANG, OTOT, DAN SENDI',
    redirect: 'bones-muscles-joints-health',
    delay: 'delay-500',
  },
  heart: {
    icon: <Heart />,
    iconWhite: <Heart color="#FCFCFC" />,
    description: 'KESEHATAN JANTUNG',
    redirect: 'heart-health',
    delay: 'delay-700',
  },
  general: {
    icon: <GeneralHealth />,
    iconWhite: <GeneralHealth color="#FCFCFC" />,
    description: 'KESEHATAN UMUM',
    redirect: 'general-health',
    delay: 'delay-700',
  },
  hair: {
    icon: <Hair />,
    iconWhite: <Hair color="#FCFCFC" />,
    description: 'PERAWATAN RAMBUT',
    redirect: 'hair-care',
    delay: 'delay-300',
  },
}



type ItemKeys = keyof typeof items
