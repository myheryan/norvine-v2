import Image from "next/image"
import { useRef, useContext, useEffect } from 'react'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'
import { Mobile, Desktop } from '@/components/responsive'
import HeadMeta from "../HeadMeta"


export default function PartOfUs() {
  const nodeRef = useRef(null)
  const nodeMobileRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  const isMobileVisible = useIsVisible(nodeMobileRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible || isMobileVisible) {
      setActiveScene('partOfUs')
    }
  }, [isMobileVisible, isVisible, setActiveScene])
  return (
    <>
    <HeadMeta />
      <Desktop>
        <div className="relative bg-zinc-950 h-screen w-full snap-start snap-always">
          <div className="absolute -z-40 h-screen w-full bg-black"></div>
          <div className="absolute -z-30 h-screen w-full opacity-40">
            <Image
              src="/landing/part-of-us.webp"
              alt="Composition background"
                className="object-cover"
              draggable={false}
              fill
            />
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="flex max-w-[41rem] flex-col items-center text-center">
              <h1
                ref={nodeRef}
                className="txt-h1 mb-16 text-center text-[#FCFCFC]"
              >
                BE A PART OF US
              </h1>
              <p className="txt-body mb-8 text-[#FCFCFC]">
                You are how we could share more of our products to reach our
                customer needs. Find out more of how to become our{' '}
                <span className="font-bold">resellers.</span>
              </p>
              <a href="https://api.whatsapp.com/send/?phone=6281370008002&text&type=phone_number&app_absent=0">
                <p className="txt-body select-none rounded-full border border-[#FCFCFC] px-8 py-[0.875rem] text-[#FCFCFC] hover:cursor-pointer">
                  SAYA TERTARIK
                </p>
              </a>
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <div
          ref={nodeMobileRef}
          className="relative h-screen w-full snap-start snap-always"
        >
          <div className="absolute -z-40 h-screen w-full bg-black"></div>
          <div className="absolute -z-30 h-screen w-full opacity-40">
            <Image
              src="/landing/part-of-us.webp"
              alt="Composition background mobile"
                className="object-cover"
              draggable={false}
              fill
            />
          </div>
          <div
            className={`flex h-full translate-y-0 items-center justify-center px-8 ${
              isMobileVisible ? '' : 'translate-y-full opacity-0'
            } animate`}
          >
            <div className="flex max-w-[41rem] flex-col items-center text-center">
              <h1 className="txt-mobile-h1 mb-16 text-center text-[#FCFCFC]">
                BE A PART OF US
              </h1>
              <p className="txt-mobile-body mb-8 text-[#FCFCFC]">
                You are how we could share more of our products to reach our
                customer needs. Find out more of how to become our{' '}
                <span className="font-bold">resellers.</span>
              </p>
              <a href="https://api.whatsapp.com/send/?phone=6281370008002&text&type=phone_number&app_absent=0">
                <p className="txt-mobile-body select-none rounded-full border border-[#FCFCFC] px-8 py-[0.875rem] text-[#FCFCFC] hover:cursor-pointer">
                  SAYA TERTARIK
                </p>
              </a>
            </div>
          </div>
        </div>
      </Mobile>
    </>
  )
}
