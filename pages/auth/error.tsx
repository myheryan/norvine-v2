"use client";

import { useRouter } from "next/router";
import Head from "next/head";
import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

export default function AuthErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  // Mapping error codes dari NextAuth ke pesan Bahasa Indonesia
  const getErrorMessage = (err: string | string[] | undefined) => {
    switch (err) {
      case "Configuration":
        return "Terjadi kesalahan pada konfigurasi server. Mohon hubungi teknisi.";
      case "AccessDenied":
        return "Akses ditolak. Anda tidak memiliki izin untuk masuk atau akun telah diblokir.";
      case "Verification":
        return "Tautan verifikasi sudah kedaluwarsa atau telah digunakan sebelumnya.";
      case "OAuthSignin":
        return "Gagal menghubungi penyedia layanan (Google). Silakan coba sesaat lagi.";
      case "OAuthCallback":
        return "Terjadi gangguan saat memproses akun Google Anda.";
      case "OAuthAccountNotLinked":
        return "Email ini sudah terdaftar melalui metode lain. Silakan masuk menggunakan email & password.";
      case "EmailSignin":
        return "Gagal mengirim email verifikasi. Pastikan alamat email Anda benar.";
      case "CredentialsSignin":
        return "Email atau password yang Anda masukkan tidak sesuai.";
      default:
        return "Terjadi kesalahan autentikasi yang tidak terduga.";
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-normal antialiased">
      <Head>
        <title>ERROR | NORVINE</title>
      </Head>

      <div className="max-w-md w-full text-center space-y-10">
        {/* Visual Identity */}
        <div className="flex justify-center">
          <div className="w-20 h-20 border border-zinc-100 flex items-center justify-center text-zinc-900">
            <FiAlertCircle size={32} strokeWidth={1} />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-[10px] uppercase tracking-[0.5em] text-zinc-400">
            Authentication Error
          </h1>
          <h2 className="text-zinc-900 text-[14px] leading-relaxed tracking-wide px-4">
            {getErrorMessage(error)}
          </h2>
          {error && (
            <p className="text-[9px] text-zinc-300 font-mono uppercase">
              Error Code: {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full py-4 bg-zinc-900 text-white text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all rounded-none flex items-center justify-center gap-2"
          >
            <FiRefreshCw size={14} /> Coba Lagi
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 border border-zinc-200 text-zinc-500 text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-50 transition-all rounded-none flex items-center justify-center gap-2"
          >
            <FiArrowLeft size={14} /> Kembali ke Beranda
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-12 border-t border-zinc-50">
          <p className="text-[10px] text-zinc-300 uppercase tracking-widest leading-loose">
            Butuh bantuan terkait akun?<br />
            <a href="mailto:support@norvine.co.id" className="text-zinc-400 underline decoration-zinc-100 underline-offset-4">
              Hubungi Layanan Pelanggan
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}