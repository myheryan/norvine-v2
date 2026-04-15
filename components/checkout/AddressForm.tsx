import { FiMapPin } from 'react-icons/fi'
import InputField from '../ui/InputField'

export default function AddressForm() {
  return (
    <div className="bg-white relative md:rounded md:shadow-sm p-4 md:p-7 pt-5">
      <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #6fa6d6, #6fa6d6 33px, transparent 0, transparent 41px, #f18d9b 0, #f18d9b 74px, transparent 0, transparent 82px)' }}></div>
      <h2 className="text-[13px] md:text-lg text-slate-800 md:text-[#ee4d2d] flex items-center gap-2 mb-4 font-medium">
        <FiMapPin className="text-[#ee4d2d]" size={18} /> Alamat Pengiriman
      </h2>
      <div className="grid grid-cols-12 gap-3 md:pl-7">
        <InputField id="name" placeholder="Nama Lengkap" col="col-span-12 md:col-span-4" />
        <InputField id="phone" type="tel" placeholder="Nomor Telepon" col="col-span-12 md:col-span-4" />
        <InputField id="province" placeholder="Provinsi" col="col-span-6 md:col-span-4" />
        <InputField id="city" placeholder="Kota/Kab" col="col-span-6 md:col-span-2" />
        <InputField id="postalCode" placeholder="Kode Pos" col="col-span-12 md:col-span-2" />
        <InputField id="address" placeholder="Detail Alamat (Jalan, No. Rumah, RT/RW)" col="col-span-12 md:col-span-8" isTextarea />
      </div>
    </div>
  )
}