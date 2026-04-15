import Head from 'next/head'
import { FiTool } from 'react-icons/fi'

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center font-sans">
      <Head>
        <title>Sedang Dalam Perbaikan | Norvine</title>
      </Head>

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 mb-6 animate-pulse">
        <FiTool size={40} className="text-slate-700" />
      </div>
      
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Halaman Sedang Diperbarui
      </h1>
      <p className="mb-8 max-w-md text-slate-500">
        Kami sedang melakukan beberapa peningkatan pada halaman ini untuk memberikan pengalaman yang lebih baik. Silakan kembali lagi nanti.
      </p>

      <button 
        onClick={() => window.history.back()}
        className="rounded-full bg-[#1D1E20] px-8 py-3 text-sm font-semibold tracking-widest text-white transition-all hover:bg-slate-700"
      >
        KEMBALI
      </button>
    </div>
  )
}