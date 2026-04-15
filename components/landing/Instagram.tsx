import { FiInstagram } from 'react-icons/fi'
import Image from "next/image"

import { useRef, useContext, useEffect } from 'react'
import { useIsVisible } from 'react-is-visible'
import Marquee from 'react-fast-marquee'

import { NavbarContext } from '../context/NavbarContext'
import NavPlaceHolder from '../NavPlaceHolder'

const instagramPics = [
  '/landing/instagram/1.-C1000.png',
  '/landing/instagram/1.-Glucosamine-(Rev).png',
  '/landing/instagram/2.-Calcium.png',
  '/landing/instagram/2.-Glucosamine-(Rev).png',
  '/landing/instagram/4.-Carnitine.png',
  '/landing/instagram/Baru-3.png',
  '/landing/instagram/C-Carnitine.jpeg',
  '/landing/instagram/Hologram-2.png',
  '/landing/instagram/naturheilkunde.jpg',
  '/landing/instagram/norvineinsta-1.webp',
  '/landing/instagram/norvineinsta-3.webp',
  '/landing/instagram/pic4.jpg',
  '/landing/instagram/pic6.jpg',
  '/landing/instagram/pic8.png',
  '/landing/instagram/pic9.jpg',
  '/landing/instagram/pic10.jpeg',
]

export default function Instagram() {
  const nodeRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible) {
      setActiveScene('instagram')
    } else {
      // setActiveScene(true)
    }
  }, [isVisible, setActiveScene])

  return (
    <>
      <NavPlaceHolder />
      <div className="relative flex h-fit justify-center overflow-visible bg-[#fcfcfc] pt-5">
        <a
          href="https://www.instagram.com/norvine.id/"
          rel="noopener noreferrer"
          target="_blank"
          ref={nodeRef}
          className="absolute z-10 flex flex-col items-center justify-center self-center"
        >
          <h1 className="txt-mobile-h1 md:txt-h1">@NORVINE.ID</h1>
          <div className="my-2 flex flex-row items-center">
            <FiInstagram size={22} color="#1D1E20" />
            <p className="txt-mobile-body md:txt-body ml-2 text-[#1D1E20]">
              Instagram
            </p>
          </div>
        </a>
        <Marquee pauseOnHover speed={25}>
          <div className="flex w-full items-center py-5">
            {instagramPics.map((text) => (
              <div
                key={text}
                className="relative z-0 aspect-square h-48 opacity-70 transition hover:z-10 hover:scale-110 hover:opacity-100 md:h-72"
              >
                <Image src={text} alt={text} width={300} height={300}/>
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </>
  )
}
