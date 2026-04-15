import { FiInstagram } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import { MdOutlineEmail, MdOutlineLocationOn } from 'react-icons/md'
import { IoCallOutline } from 'react-icons/io5'
import { IconType } from 'react-icons'
import { FormEvent, useContext, useEffect, useRef, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useIsVisible } from 'react-is-visible'

import {
  ContactUsResponse,
  ContactUsVariable,
  CONTACT_US,
} from '@/lib/graphql/query'
import { NavbarContext } from '../context/NavbarContext'
import { Mobile, Desktop } from '@/components/responsive'

import NavPlaceHolder from '../NavPlaceHolder'

export default function ContactUs() {
  const nodeRef = useRef(null)
  const isVisible = useIsVisible(nodeRef)
  let { setActiveScene } = useContext(NavbarContext)
  useEffect(() => {
    if (isVisible) {
      setActiveScene('contactUs')
    }
  }, [isVisible, setActiveScene])
  let [fullName, setFullName] = useState('')
  let [email, setEmail] = useState('')
  let [body, setBody] = useState('')

  let [sendEmail, { data }] = useMutation<ContactUsResponse, ContactUsVariable>(
    CONTACT_US,
    {
      fetchPolicy: 'network-only',
    }
  )

  useEffect(() => {
    if (data && data.contactUs.success) {
      window.alert('Email Sent !')
    }
  }, [data])

  // ToDo: send email
  let onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await sendEmail({
      variables: {
        name: fullName,
        email,
        message: body,
      },
    })
  }

  return (
    <div id="contact-us">
      <Desktop>
        <div className="flex h-screen w-full snap-start snap-always items-start pt-5">
          <div className="mx-8 flex-col">
            <h1 className="txt-h1 text-[#1D1E20]">CONTACT US</h1>
            <div className="mt-10 flex">
              <div className="flex flex-col">
                <form onSubmit={onSubmit} className="flex flex-col">
                  <p ref={nodeRef} className="txt-body mb-10 text-[#777777]">
                    Silakan isi formulir di bawah ini untuk menghubungi kami
                    tentang masalah yang Anda alami atau untuk meminta informasi
                    tentang produk kami atau perusahaan kami
                  </p>
                  <div className="flex flex-row justify-between">
                    <div className="border-[#1D1E20]-12 mr-4 flex h-[4.0625rem] grow self-stretch border-2 py-4 px-4">
                      <input
                        type="text"
                        placeholder="Nama lengkap"
                        className="txt-body grow text-[#000000] outline-none"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </div>
                    <div className="border-[#1D1E20]-12 ml-4 flex h-[4.0625rem] grow self-stretch border-2 px-4 py-4">
                      <input
                        type="email"
                        placeholder="Alamat email"
                        className="txt-body flex grow text-[#000000] outline-none"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="border-[#1D1E20]-12 my-8 flex h-[13.5625rem] self-stretch border-2 py-4 px-4">
                    <textarea
                      placeholder="Tuliskan pesan anda..."
                      className="txt-body flex grow self-stretch text-[#000000] outline-none"
                      maxLength={200}
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="self-end rounded-full bg-[#1D1E20] py-3 px-6"
                  >
                    <h5 className="txt-h5 text-[#FCFCFC]">KIRIM</h5>
                  </button>
                </form>
              </div>
              <div className="bg-red">
                <div className="ml-8">
                  <h3 className="txt-h3 text-[#1D1E20]">Norvine Supplements</h3>
                  <div className="my-2 flex flex-row items-center">
                    <FiInstagram size={22} color="#EC0000" />
                    <p className="txt-body ml-2 font-bold text-[#777777]">
                      @norvine.id
                    </p>
                  </div>
                  <div className="my-2 flex flex-row items-center">
                    <ImWhatsapp size={22} color="#EC0000" className="pb-0.5" />
                    <p className="txt-body ml-2 font-bold text-[#777777]">
                      0813-7000-8002
                    </p>
                  </div>
                  <div className="my-2 flex flex-row items-center">
                    <MdOutlineEmail size={22} color="#EC0000" />
                    <p className="txt-body ml-2 font-bold text-[#777777]">
                      support@norvine.co.id
                    </p>
                  </div>
                </div>
                <div className="ml-8 mt-8">
                  <h3 className="txt-h3 text-[#1D1E20]">PT Satu Jaya Tama</h3>
                  <div className="my-2 flex flex-row items-center">
                    <IoCallOutline size={22} color="#EC0000" />
                    <p className="txt-body ml-2 font-bold text-[#777777]">
                      021-5433-4193
                    </p>
                  </div>
                  <div className="my-2 flex flex-row items-center">
                    <MdOutlineEmail size={22} color="#EC0000" />
                    <p className="txt-body ml-2 font-bold text-[#777777]">
                      support@1jayatama.com
                    </p>
                  </div>
                  <div className="my-2 flex flex-row items-center">
                    <MdOutlineLocationOn size={22} color="#EC0000" />
                    <p className="txt-body ml-2 font-bold text-[#777777]">
                      Jl.Rawa Buaya No.5H, Jakarta Barat – 11740{' '}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Desktop>
      <Mobile>
        <NavPlaceHolder />
        <div className="mb-24 flex h-fit w-full items-center">
          <div className="mx-4 space-y-12">
            <h1 className="txt-mobile-h1 text-[#1D1E20]">CONTACT US</h1>
            <form onSubmit={onSubmit} className="flex flex-col space-y-8">
              <p ref={nodeRef} className="txt-mobile-body text-[#777777]">
                Silakan isi formulir di bawah ini untuk menghubungi kami tentang
                masalah yang Anda alami atau untuk meminta informasi tentang
                produk kami atau perusahaan kami
              </p>
              <div className="space-y-4">
                <div className="border-[#1D1E20]-12 flex h-14 grow self-stretch border-2 py-4 px-4">
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    className="txt-mobile-body grow text-[#000000] outline-none"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div className="border-[#1D1E20]-12 flex h-14 grow self-stretch border-2 px-4 py-4">
                  <input
                    type="email"
                    placeholder="Alamat email"
                    className="txt-mobile-body flex grow text-[#000000] outline-none"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="border-[#1D1E20]-12 flex h-48 self-stretch border-2 py-4 px-4">
                <textarea
                  placeholder="Tuliskan pesan anda..."
                  className="txt-mobile-body flex grow self-stretch text-[#000000] outline-none"
                  maxLength={200}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[#1D1E20] py-3 px-6"
              >
                <h5 className="txt-mobile-h3 text-[#FCFCFC]">KIRIM</h5>
              </button>
            </form>

            <div className="space-y-8">
              <h3 className="txt-h3 text-[#1D1E20]">Norvine Supplements</h3>
              {[
                { Icon: FiInstagram, text: '@norvine.id' },
                { Icon: ImWhatsapp, text: '0813-7000-8002' },
                { Icon: MdOutlineEmail, text: 'support@norvine.co.id' },
              ].map((props, idx) => (
                <ContactUsText key={idx} {...props} />
              ))}

              <h3 className="txt-h3 text-[#1D1E20]">PT Satu Jaya Tama</h3>
              {[
                { Icon: IoCallOutline, text: '021-5433-4193' },
                { Icon: MdOutlineEmail, text: 'support@1jayatama.com' },
                {
                  Icon: MdOutlineLocationOn,
                  text: 'Jl.Rawa Buaya No.5H, Jakarta Barat – 11740',
                },
              ].map((props, idx) => (
                <ContactUsText key={idx} {...props} />
              ))}
            </div>
          </div>
        </div>
      </Mobile>
    </div>
  )
}

type Props = {
  Icon: IconType
  text: string
}
function ContactUsText({ Icon, text }: Props) {
  return (
    <div className="my-2 flex flex-row items-stretch">
      <Icon size={22} color="#EC0000" />
      <p className="txt-mobile-body ml-2 text-[#777777]">{text}</p>
    </div>
  )
}
