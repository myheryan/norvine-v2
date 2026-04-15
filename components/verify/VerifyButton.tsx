import { CgCheckO, CgCloseO } from 'react-icons/cg'

import Loading from '../icons/Loading'

type Props = {
  type: 'neutral' | 'loading' | 'success' | 'fail'
  onPress: () => void
}

export default function VerifyButton({ type, onPress }: Props) {
  return (
    <div
      onClick={() => {
        type === 'neutral' && onPress()
      }}
      className={`duration-500 ${
        type === 'neutral' ? 'hover:bg-[#2C2E31E5]' : ''
      } flex h-14 w-full min-w-[13rem] justify-center md:w-fit ${
        type === 'neutral' ? 'cursor-pointer' : 'cursor-not-allowed'
      } select-none items-center rounded-full ${
        type === 'success'
          ? 'bg-[#27AE60]'
          : type === 'fail'
          ? 'bg-[#EC0000]'
          : 'bg-[#1D1E20]'
      }  px-8 py-3 transition-all`}
    >
      {type === 'loading' ? (
        <div className="flex w-full justify-center">
          <div className="h-16 w-16">
            <Loading></Loading>
          </div>
        </div>
      ) : type === 'neutral' ? (
        <p className="txt-body text-[#FFF]">CEK VERIFIKASI</p>
      ) : type === 'success' ? (
        <div className="flex-column flex items-center space-x-[0.625rem]">
          <CgCheckO color="#FFF" size={24} />
          <p className="txt-body text-[#FFF]">PRODUK TERDAFTAR</p>
        </div>
      ) : (
        <div className="flex-column flex items-center space-x-[0.625rem]">
          <CgCloseO color="#FFF" size={24} />
          <p className="txt-body text-[#FFF]">PRODUK TIDAK TERDAFTAR</p>
        </div>
      )}
    </div>
  )
}
