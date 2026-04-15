import Image from "next/image"
import Link from 'next/link'
import { useState } from 'react'

import { Mobile, Desktop } from "../responsive"
import { formatRp, getCloudinaryImage, replaceSpace }  from '@/lib/utils'

type Props = {
  id: string
  name: string;
  thumbnailUrl: string;
  quantity: string[];
  thumbnailDescription?: string | null;
  price?: number; // ✅ Tambahkan price ke dalam Props
  [key: string]: any; 
}

export default function Product({id, thumbnailUrl, quantity, name, thumbnailDescription, price = 0,
}: Props) {

  let [isActive, setIsActive] = useState(false);
  const imageURL = getCloudinaryImage(thumbnailUrl, 400, 400) || `/products/${id}/${replaceSpace(quantity[0]).toLowerCase()}/front.webp`;
  return (
    <Link
      href={`/product/${id}/${quantity[0].toLowerCase().replace(' ', '-')}`}
    >

      <Desktop>
        <div
          className="mb-8 h-[20.562rem] w-full cursor-pointer overflow-hidden"
          onMouseEnter={() => {
            setIsActive(true)
          }}
          onMouseLeave={() => {
            setIsActive(false)
          }}
        >
          <div
            className={`flex aspect-square h-full w-full items-center transition duration-300 ease-out ${
              isActive ? 'bg-[#CF534E]' : 'bg-[#E5E5E5]'
            } ${isActive ? 'scale-125' : 'scale-100'}`}
          >
            <div className="flex-1">
              <Image
                src={imageURL}
                alt={`${name} ${quantity[0]}`}
                width={396}
                height={396}
                className="h-auto w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="cursor-pointer">
          <h3
            className={`txt-h3  text-clamp-2 transition duration-300 ease-out ${
              isActive ? 'text-[#EC0000]' : ''
            }`}
          >
            {name}
          </h3>
          <p className="text-base  text-clamp-2 text-[#777777]">
            {thumbnailDescription}
          </p>
          
          {/* ✅ BUNGKUS HARGA DAN VARIAN DI SINI (DESKTOP) */}
          <div className="flex flex-row items-center flex-wrap justify-between mt-3">
            {/* Bagian Kiri: Harga */}
            <p className="txt-h4 font-bold text-[#1D1E20]">
              {formatRp(price)}
            </p>
            
            {/* Bagian Kanan: Varian (Quantity) */}
            <div className="flex flex-row space-x-2">
              {quantity.map((qty) => (
                <h5
                  key={qty}
                  className="text-white bg-zinc-950 rounded-full border border-[#1D1E20] py-1 px-3 text-[#1D1E20]"
                >
                  {qty}
                </h5>
              ))}
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <div className="mb-4 w-full overflow-hidden">
          <div className="flex aspect-square h-full w-full items-center bg-[#F6F6F6] transition duration-300 ease-out">
            <div className="flex-1">
              <Image
                src={imageURL}
                alt={`${name} ${quantity[0]}`}
                width={156}
                height={156}
                className="h-auto w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="cursor-pointer">
          <h3 className="txt-mobile-h3 text-clamp-1 transition duration-300 ease-out">
            {name}
          </h3>
          <p className="text-xs text-clamp-2 mb-2 text-[#777777]">
            {thumbnailDescription}
          </p>

          {/* ✅ BUNGKUS HARGA DAN VARIAN DI SINI (MOBILE) */}
          <div className="flex flex-col md:flex-row items-start gap-3 justify-between">
            {/* Bagian Kiri: Harga */}
            <p className="txt-mobile-h4 font-bold text-[#1D1E20]">
              {formatRp(price)}
            </p>

            {/* Bagian Kanan: Varian (Quantity) */}
            <div className="flex flex-row space-x-2">
              {quantity.map((qty) => (
                <h5
                  key={qty}
                  className="txt-mobile-h5 rounded-full border border-[#1D1E20] py-1 px-3 font-bold text-[#1D1E20]"
                >
                  {qty}
                </h5>
              ))}
            </div>
          </div>
        </div>
      </Mobile>

    </Link>
  );
}