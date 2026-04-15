import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Link from "next/link";

// Import React Icons
import { 
  FiArrowLeft, 
  FiShield, 
  FiZap, 
  FiLoader,
  FiCheckCircle,
  FiLock 
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GiPartyPopper } from "react-icons/gi";
import { Input } from "@/components/ui/baseInput";
import { Button } from "@base-ui/react";

export default function RegisterPage() {
  const [step, setStep] = useState(1); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(0); 

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birth, setBirth] = useState("");
  const [countryCode, setCountryCode] = useState("+62");
  const [phoneNumber, setPhoneNumber] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State baru
  const [otp, setOtp] = useState(""); 
  
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const [error, setError] = useState(""); 
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRequestOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setIsOtpLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "request" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim OTP.");
      setCountdown(60); 
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi kecocokan password sebelum lanjut
    if (step === 2 && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsStepLoading(true);

    try {
      if (step === 1) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, action: "check-email" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setStep(2);
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            name, 
            birth, 
            phoneNumber: `${countryCode}${phoneNumber}`, 
            password, 
            otp,
            action: "verify" 
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
            router.push(`/auth/error?error=${result.error}`);
            return;
        }

        setShowSuccessModal(true);
        setTimeout(() => {
          router.push("/user/profile");
        }, 3000);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsStepLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white text-zinc-900">

      {/* KANAN: AREA FORM */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 relative bg-white min-h-screen">
        <div className="w-full max-w-[420px] mx-auto flex flex-col flex-1 lg:justify-center">
          <div className="pt-4 lg:pt-0">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} className="text-zinc-600 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 p-2.5 rounded-full -ml-2">
                    <FiArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-3xl font-bold tracking-tight">
                  {step === 1 ? "Daftar Akun" : "Verifikasi & Profil"}
                </h2>
              </div>
              <p className="text-zinc-500 text-sm">
                {step === 1 ? "Masukkan email Anda untuk mulai berbelanja." : "Lengkapi data keamanan dan profil Anda."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-zinc-700 font-medium text-sm block ml-1">Alamat Email</label>
                    <input 
                      type="email" 
                      placeholder="nama@email.com"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all text-base"
                    />
                  </div>
                  {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                  <button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold rounded-xl bg-orange-700 hover:bg-zinc-900 text-white shadow-sm transition-all disabled:bg-zinc-600 flex items-center justify-center" 
                    disabled={isStepLoading || !email}
                  >
                    {isStepLoading ? <FiLoader className="h-5 w-5 animate-spin" /> : "Lanjutkan"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">Email Terverifikasi</span>
                      <span className="text-zinc-700 font-semibold text-sm">{email}</span>
                    </div>
                    <FiCheckCircle className="text-emerald-500 h-5 w-5" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-700 font-medium text-xs block ml-1">Nama Lengkap</label>
                    <input placeholder="Sesuai Identitas" value={name} onChange={(e) => setName(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-zinc-950 outline-none transition-all text-sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-zinc-700 font-medium text-xs block ml-1">Tgl Lahir</label>
                      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-700 font-medium text-xs block ml-1">No. WhatsApp</label>
                      <div className="flex rounded-xl border border-zinc-200 bg-zinc-50/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-950 overflow-hidden">
                        <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-zinc-100 px-2 text-xs font-medium border-r outline-none cursor-pointer">
                          <option value="+62">+62</option>
                        </select>
                        <input placeholder="812xxx" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} required className="h-11 border-0 px-3 w-full bg-transparent outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE PASSWORD FIELD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-zinc-700 font-medium text-xs block ml-1">Password</label>
                      <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-700 font-medium text-xs block ml-1">Konfirmasi</label>
                      <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white outline-none text-sm" />
                    </div>
                  </div>

                  {/* VERIFIKASI KODE */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-zinc-900 font-bold text-xs block ml-1 flex items-center gap-1.5">
                      <FiLock className="h-3 w-3" /> Verifikasi OTP
                    </label>
                    <div className="relative flex items-center">
                      <Input 
                        type="text" 
                        placeholder="000000" 
                        maxLength={6}
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                        required 
                        className="w-full h-12 px-4 pr-32 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-zinc-950 transition-all text-base "
                      />
                      <div className="absolute right-1.5 top-1.5 bottom-1.5">
                        <Button 
                          type="button" 
                          onClick={handleRequestOtp}
                          disabled={isOtpLoading || countdown > 0}
                          className={`h-full px-3 rounded-full text-base transition-all active:scale-95 flex items-center justify-center min-w-[90px]
                            ${countdown > 0 
                              ? "bg-zinc-100 text-zinc-600 cursor-not-allowed" 
                              : "bg-zinc-950 text-white hover:bg-orange-700 shadow-sm"
                            }`}
                        >
                          {isOtpLoading ? <FiLoader className="h-4 w-4 animate-spin" /> : countdown > 0 ? `Tunggu ${countdown}s` : "Minta Kode"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>}
                  
                  <button 
                    type="submit" 
                    className="w-full h-12 text-sm font-bold rounded-xl bg-zinc-950 hover:bg-indigo-700 text-white mt-2 shadow-sm flex items-center justify-center transition-all disabled:opacity-50" 
                    disabled={isStepLoading || otp.length < 6}
                  >
                    {isStepLoading ? <FiLoader className="h-5 w-5 animate-spin" /> : "Selesaikan Pendaftaran"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {step === 1 && (
            <div className="mt-auto lg:mt-10 pb-8 lg:pb-0">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200" /></div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <span className="bg-white px-4">Metode Lain</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsGoogleLoading(true); signIn("google", { callbackUrl: "/profile" }); }}
                  type="button" 
                  className="w-full h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center gap-3 transition-all text-sm font-medium"
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? <FiLoader className="h-5 w-5 animate-spin text-zinc-500" /> : <FcGoogle className="h-5 w-5" />}
                  Daftar dengan Google
                </button>
              </div>
              <p className="text-center text-xs text-zinc-500 pt-8 italic">
                Sudah punya akun? <Link href="/login" className="font-bold text-zinc-950 underline underline-offset-4">Masuk</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <GiPartyPopper className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 tracking-tighter mb-2 uppercase">Selamat!</h3>
            <p className="text-zinc-500 text-xs px-4 leading-relaxed">Akun Anda siap digunakan. Menuju halaman profil dalam sekejap...</p>
            <div className="mt-8 w-full h-1 bg-zinc-100 overflow-hidden relative rounded-full">
              <div className="absolute top-0 left-0 h-full bg-zinc-950 w-full rounded-full origin-left animate-progress" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
        .animate-progress { animation: progress 3s linear forwards; }
      `}</style>
    </div>
  );
}