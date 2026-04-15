'use client' // Wajib untuk Next.js 16

import { useRef, useState } from 'react'
import { Mobile, Desktop } from '../responsive'


type Props = {
  value: string
  onChange: (value: string) => void
}

export default function TextInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isActive, setIsActive] = useState(false)

  const isPlaceholderActive = !isActive && !value

  // Fungsi pintar untuk menggantikan fitur react-input-mask
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Ambil hanya huruf dan angka, ubah ke uppercase
    let raw = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // 2. Batasi maksimal 16 karakter kode asli
    raw = raw.substring(0, 16)

    // 3. Sisipkan spasi otomatis setiap 4 karakter
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw
    
    // 4. Kirim data yang sudah rapi
    onChange(formatted)
  }

  return (
    <div className="w-full max-w-[39.125rem]">
      <div
        onClick={() => {
          setIsActive(true)
          inputRef.current?.focus()
        }}
        className="relative mb-8 flex h-16 cursor-pointer select-none border-2 border-[#1D1E201F] px-4"
      >
        {/* Input bawaan HTML yang 100% aman dari error findDOMNode */}
        <input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={() => setIsActive(false)}
          maxLength={19} // 16 karakter + 3 spasi
          placeholder={isActive ? "**** **** **** ****" : ""}
          className="txt-body w-full h-full bg-transparent text-[#777777] outline-none pt-4"
        />

        <div
          className={`absolute flex h-16 items-center transition-all pointer-events-none ${
            !isPlaceholderActive ? '-translate-y-8' : ''
          }`}
        >
          <Desktop>
            <p
              className={`transition-all ${
                !isPlaceholderActive ? 'txt-h5' : 'txt-body'
              } bg-white text-[#1D1E2052]`}
            >
              Masukan 16-digit kode unik pada hologram
            </p>
          </Desktop>

          <Mobile>
            <p className="txt-mobile-body bg-white text-[#1D1E2052] transition-all">
              Masukan 16-digit kode unik
            </p>
          </Mobile>
        </div>
      </div>
    </div>
  )
}

