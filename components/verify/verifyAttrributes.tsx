'use client'

import { useRef, useState } from 'react'
import { CgCheckO, CgCloseO } from 'react-icons/cg'
import Loading from '../icons/Loading'
import { Mobile, Desktop } from '../responsive'

type VerifyButtonProps = {
  type: 'neutral' | 'loading' | 'success' | 'fail'
  onPress: () => void
}

type TextInputProps = {
  value: string
  onChange: (value: string) => void
}

export function TextInput({ value, onChange }: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isActive, setIsActive] = useState(false)
  const isPlaceholderActive = !isActive && !value

// Label akan naik jika: Input sedang diklik (Active) ATAU Input sudah ada isinya (value)
  const isFloating = isActive || (value && value.length > 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 16)
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw
    onChange(formatted)
  }

  return (
    <div className="w-full max-w-[39.125rem]">
      {/* Container utama dengan z-index agar tidak tertutup */}
      <div
        className="relative mb-8 flex h-16 border-2 border-[#1D1E201F] px-4 items-center bg-white z-10"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          maxLength={19} // 16 digit + 3 spasi
          placeholder={isActive ? "**** **** **** ****" : ""}
          className="txt-body w-full h-full bg-transparent text-[#777777] outline-none pt-4 z-20"
        />

        <div
          className={`absolute left-4 flex items-center transition-all duration-300 pointer-events-none z-0 ${
            isFloating 
              ? '-translate-y-7 scale-90 opacity-100' // Posisi saat naik (Floating)
              : 'translate-y-0 opacity-50'           // Posisi saat di tengah (Normal)
          }`}
        >
          {/* Teks Label: Pakai CSS hidden/block agar transisi transform tetap satu div */}
          <span className="bg-white px-1 text-[#1D1E2052] font-bold tracking-tight">
            {/* Teks Desktop */}
            <span className="hidden md:inline">Masukan 16-digit kode unik pada hologram</span>
            {/* Teks Mobile */}
            <span className="inline md:hidden text-sm uppercase">Masukan 16-digit kode</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function VerifyButton({ type, onPress }: VerifyButtonProps) {
  return (
    <button // Ganti div ke button untuk aksesibilitas & respon mobile yang lebih baik
      onClick={(e) => {
        e.preventDefault()
        if (type === 'neutral') onPress()
      }}
      disabled={type !== 'neutral'}
      className={`relative flex h-14 w-full min-w-[13rem] justify-center md:w-fit items-center rounded-full px-8 py-3 transition-all duration-500 font-bold text-white z-30 touch-manipulation ${
        type === 'neutral' ? 'bg-[#1D1E20] hover:bg-[#2C2E31E5] cursor-pointer' : 
        type === 'success' ? 'bg-[#27AE60] cursor-not-allowed' :
        type === 'fail' ? 'bg-[#EC0000] cursor-not-allowed' : 
        'bg-[#1D1E20] cursor-wait'
      }`}
    >
      {type === 'loading' ? (
        <div className="scale-50"><Loading /></div>
      ) : type === 'neutral' ? (
        "CEK VERIFIKASI"
      ) : type === 'success' ? (
        <div className="flex items-center space-x-2">
          <CgCheckO size={20} />
          <span>PRODUK TERDAFTAR</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <CgCloseO size={20} />
          <span>TIDAK TERDAFTAR</span>
        </div>
      )}
    </button>
  )
}