import Image from "next/image"

import { useContext, useEffect, useRef } from 'react'
import { FiInstagram } from 'react-icons/fi'
import { useIsVisible } from 'react-is-visible'

import { NavbarContext } from '../context/NavbarContext'

export default function ComingSoon() {
  const nodeRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible) {
      setActiveScene('overview')
    }
  }, [isVisible, setActiveScene])

  return (
    <div className="pt-35 flex  w-full grow flex-col items-center justify-center ">
      <div className="relative flex-col ">
        <div className="relative h-[547px] w-[1011px] 3xl:h-[730px] 3xl:w-[1348px]">
          <Image
            src={`/landing/2022.svg`}
            alt={`Composition background`}
            className="object-cover"
            width={1348}
            height={730}
            draggable={false}
            
          />
        </div>

        <div className="absolute -mt-[18.5%] ml-10 flex-col">
          <h1 ref={nodeRef} className="txt-comingsoon text-[6rem]">
            WE ARE
          </h1>
          <h1 className="txt-comingsoon text-[6rem]">COMING SOON</h1>
        </div>
        <div className="mt-10 flex">
          <div className="flex basis-1/3" />
          <div className="flex basis-1/3 flex-row items-start justify-center pr-10">
            <FiInstagram size={24} color="#1D1E20" className="mt-0.5" />
            <p className="txt-body ml-2 font-bold text-[#777777]">Instagram</p>
          </div>
          <div className="flex basis-1/3 flex-col justify-end">
            <p className="txt-h3 mb-4 font-bold text-[#1D1E20]">
              We will tell you when we launch
            </p>
            <div className="border-[rgba(206, 206, 206, 0.4) mb-8 flex w-[26.625rem] justify-between overflow-hidden rounded-full border">
              <div className="flex grow px-6 py-4">
                <input
                  type="text"
                  placeholder="Alamat Email Anda"
                  className="txt-body flex grow  bg-transparent text-[#1D1E20] "
                />
              </div>
              <button className="bg-[#1D1E20] pr-6 pl-[0.8rem]">
                <h5 className="txt-h5 font-bold text-[#FFFFFF]">KIRIM</h5>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
