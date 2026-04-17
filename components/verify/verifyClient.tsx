'use client'

import { useContext, useEffect, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import Image from "next/image"
import { useMutation } from '@apollo/client/react'
import { useInView } from 'react-intersection-observer'

import { CHECK_SERIAL, CheckSerialResponse, CheckSerialVariable } from '@/lib/graphql/query'
import productSecurityCode from '@/public/verify/product-security-code.webp'
import TextInput from '@/components/verify/TextInput'
import VerifyButton from '@/components/verify/VerifyButton'
import { Desktop, Mobile } from '@/components/responsive'
import { Shield } from '@/components/icons'

export default function Verify() {
  // --- States ---
  const [uniqueCode, setUniqueCode] = useState<string>('')
  const [maskedValue, setMaskedValue] = useState('')
  const [showModalCharacters, setShowModalCharacters] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string>('')
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null)
  const [result, setResult] = useState<{ verified: boolean; totalCheck: number } | null>(null)

  const { ref: nodeRef, inView: isVisible } = useInView({ threshold: 0 })

  let [verifyCode, { loading: isLoading }] = useMutation<
    CheckSerialResponse,
    CheckSerialVariable
  >(CHECK_SERIAL, { fetchPolicy: 'network-only' })


  // useEffect(() => {
  //   if (typeof window !== "undefined" && "geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (pos) => setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude }),
  //       (err) => console.warn("Location access denied", err),
  //       { enableHighAccuracy: true }
  //     )
  //   }
  // }, [])


  // --- Handlers ---
  const handleChange = (masked: string) => {
    const raw = masked.replace(/[\s*]/g, '').toUpperCase()
    setUniqueCode(raw)
    setMaskedValue(masked.toUpperCase())
  }

  const onSubmit = async () => {
    if (uniqueCode.length !== 16) {
      setShowModalCharacters(true)
      return
    }

    try {
       await verifyCode({
      variables: {
        captchaToken,
        serial: uniqueCode,
        ...location,
      },
      onCompleted: (data) => {
        setResult(data.verifyCode)
      },
    })
    } catch (e) {
      console.error("Mutation error:", e)
    }
  }

  const resetVerification = () => {
    setResult(null)
    setUniqueCode('')
    setMaskedValue('')
    setCaptchaToken('')
  }

  return (
    <div>
      <Desktop>
        {showModalCharacters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-[90%] max-w-md rounded bg-white p-6">
              <h2 className="mb-2 text-lg font-bold">
                KODE BELUM LENGKAP
              </h2>

              <p className="text-sm text-gray-600">
                Pastikan Anda memasukkan 16 digit kode unik dengan benar
              </p>

              <button
                onClick={() => setShowModalCharacters(false)}
                className="mt-6 h-10 w-full rounded bg-black text-white"
              >
                OK
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-row">
          <div className="relative aspect-[928/1130] min-w-[48.33%] bg-black">
            <Image
              src={productSecurityCode}
              alt="product security code"
              className="object-cover"
              draggable={false}
              
            />
          </div>
          <div className="mt-[3.43rem] px-16 pr-18">
            <h1 ref={nodeRef} className="txt-h1 mb-8 text-[#1D1E20]">
              VERIFIKASI PRODUK <br /> NORVINE
            </h1>
            <p className="txt-body mb-8">
              <span className="font-bold">Security code</span> merupakan serial
              unik yang dimiliki setiap produk. Temukan nomor{' '}
              <span className="font-bold">security code</span> Anda pada sticker
              hologram. <br />
              Gosok bagian &quot;Scratch Here&quot; untuk mendapatkan 16 digit{' '}
              <span className="font-bold">security code</span>
            </p>
            <div>
              <TextInput
               
                value={maskedValue}
                onChange={handleChange}
              />
            </div>
            <div className="mb-8">
              {result === null && !isLoading && (
                <ReCAPTCHA
                  sitekey="6Lekd7sZAAAAAOX6jUOjiruxEcWhoShApup-kYVb"
                  onChange={(token) => {
                    setCaptchaToken(token || '')
                  }}
                />
              )}
            </div>
            <div className="mb-4 flex flex-row items-center space-x-8">
              <VerifyButton
                type={
                  isLoading
                    ? 'loading'
                    : result?.verified
                    ? 'success'
                    : result === null
                    ? 'neutral'
                    : 'fail'
                }
                onPress={onSubmit}
              />
              {result !== null && (
                <p
                  onClick={resetVerification}
                  className="txt-body cursor-pointer select-none text-[#777777]"
                >
                  Cek kode lainnya
                </p>
              )}
            </div>
            <div className="mb-20">
              {result && result.verified && (
                <p className="txt-body">
                  Kode unik ini telah dicek untuk yang ke-
                  <span className="font-bold text-red-600"> {result.totalCheck}</span>. Jika
                  sebelumnya Anda tidak melakukan pengecekan, harap hubungi
                  tempat Anda membeli atau hubungi kami melalui{' '}
                  <span className="text-[#EC0000]">support@norvine.co.id</span>
                </p>
              )}
              {result && !result.verified && (
                <p className="txt-body">
                  <span className="text-[#EC0000]">
                    Security code tersebut tidak tercantum pada database kami.
                  </span>
                  <br /> Silahkan periksa kembali security code anda.
                </p>
              )}
            </div>
            <div>
              <p className="txt-body mb-24">
                Autentikasi produk berguna untuk melindungi konsumen dari pihak
                - pihak yang tidak bertanggung jawab. Pastikan produk yang anda
                dapatkan terdaftar dilaman ini. Jika terjadi kendala dalam
                melakukan proses verifikasi, harap hubungi kami melalui{' '}
                <a
                  href="mailto:support@norvine.co.id"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="text-[#EC0000]">support@norvine.co.id</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </Desktop>

      <Mobile>
        <div className="flex flex-col">
          <div className="relative aspect-[928/1130] min-w-[48.33%] bg-black">
            <Image
              src={productSecurityCode}
              alt="product security code"
              className="object-cover"
              draggable={false}
              
            />
          </div>
          <div className="px-4 pt-8">
            <h1 ref={nodeRef} className="txt-mobile-h1 mb-8 text-[#1D1E20]">
              VERIFIKASI PRODUK <br /> NORVINE
            </h1>
            <p className="txt-mobile-body mb-8">
              <span className="font-bold">Security code</span> merupakan serial
              unik yang dimiliki setiap produk. Temukan nomor{' '}
              <span className="font-bold">security code</span> Anda pada sticker
              hologram. <br />
              Gosok bagian &quot;Scratch Here&quot; untuk mendapatkan 16 digit{' '}
              <span className="font-bold">security code</span>
            </p>
            <div>
              <TextInput
                value={maskedValue}
                onChange={handleChange}
              />
            </div>
            <div className="mb-8 flex flex-row justify-center">
              {result === null && !isLoading && (
                <ReCAPTCHA
                  sitekey="6Lekd7sZAAAAAOX6jUOjiruxEcWhoShApup-kYVb"
                  onChange={(token) => {
                    setCaptchaToken(token || '')
                  }}
                />
              )}
            </div>
            <div className="mb-8 flex flex-col items-center space-y-8">
              <VerifyButton
                type={
                  isLoading
                    ? 'loading'
                    : result?.verified
                    ? 'success'
                    : result === null
                    ? 'neutral'
                    : 'fail'
                }
                onPress={onSubmit}
              />
              {result !== null && (
                <p
                  onClick={resetVerification}
                  className="txt-body cursor-pointer select-none text-[#777777]"
                >
                  Cek kode lainnya
                </p>
              )}
            </div>
            <div className="mb-8">
              {result && result.verified && (
                <p className="txt-mobile-body">
                  Kode unik ini telah dicek untuk yang ke-
                  <span className="font-bold text-red-600"> {result.totalCheck}</span>. Jika
                  sebelumnya Anda tidak melakukan pengecekan, harap hubungi
                  tempat Anda membeli atau hubungi kami melalui{' '}
                  <span className="text-[#EC0000]">support@1jayatama.com</span>
                </p>
              )}
              {result && !result.verified && (
                <p className="txt-mobile-body">
                  <span className="text-[#EC0000]">
                    Security code tersebut tidak tercantum pada database kami.
                  </span>
                  <br /> Silahkan periksa kembali security code anda.
                </p>
              )}
            </div>
            <div className="flex flex-row justify-center space-x-2">
              <div className="h-[1.5rem] w-[1.5rem]">
                <Shield />
              </div>
              <p className="txt-mobile-body mb-8">
                Autentikasi produk berguna untuk melindungi konsumen dari pihak
                - pihak yang tidak bertanggung jawab. Pastikan produk yang anda
                dapatkan terdaftar dilaman ini. Jika terjadi kendala dalam
                melakukan proses verifikasi, harap hubungi kami melalui{' '}
                <a
                  href="mailto:support@norvine.co.id"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="text-[#EC0000]">support@norvine.co.id</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </Mobile>
    </div>
  )
}