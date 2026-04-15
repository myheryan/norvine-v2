import { useState } from "react";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

import { 
  FiLoader,
  FiLock,
  FiMail
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast, Toaster } from "sonner"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { callbackUrl } = router.query;

  const handleGoogleLogin = async () => {
        const session = await getSession();


    try {
          const result = await signIn("google", { 
            callbackUrl: (callbackUrl as string) || "/", 
            redirect: false 
          });

          if (result?.error) {
            router.push(`/auth/error?error=${result.error}`);
            return;
          }

          setTimeout(() => {
            router.push(result?.url || "/");
          }, 1500);
    } catch (err) {
      router.push("/auth/error?error=OAuthSignin");
    }



  };
    
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah.");
        toast.error("Otentikasi Gagal", {
          description: "Periksa kembali kredensial Anda.",
        });
        setIsLoading(false);
      } else {
        router.push("/"); // Redirect ke homepage atau dashboard
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server.");
      router.push(`/auth/error?error=${err.error}`);
      setIsLoading(false);
    }
  };

  return (
      
      <div className="w-full flex items-center justify-center p-8 sm:p-12 relative bg-white min-h-screen">
        <div className="w-full max-w-[400px] flex flex-col justify-between">
          
          <div className="pt-4 lg:pt-0">
            <div className="space-y-2 mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900  text-center">
                Sign In
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-zinc-700 font-medium text-sm block ml-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="email" 
                    placeholder="nama@email.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-zinc-700 font-medium text-sm block">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-orange-700 hover:text-blue-700">Lupa Password?</Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}
              
              <button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white mt-4 shadow-sm flex items-center justify-center transition-all disabled:opacity-50 active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? <FiLoader className="h-5 w-5 animate-spin" /> : "Masuk Sekarang"}
              </button>
            </form>
          </div>

          <div className="mt-8 lg:mt-12 pb-8">
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200" /></div>
                <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
                  <span className="bg-white px-4 text-zinc-600">Atau masuk instan</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                type="button" 
                className="w-full h-12 text-base font-medium rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <FiLoader className="h-5 w-5 animate-spin text-zinc-500" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
                Masuk dengan Google
              </button>
            </div>

            <p className="text-center text-sm text-zinc-500 pt-8">
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline underline-offset-4">
                Daftar Gratis
              </Link>
            </p>
          </div>

        </div>
      </div>

  );
}