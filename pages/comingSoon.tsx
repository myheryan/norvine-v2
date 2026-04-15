import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function NorvineComingSoon() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Masukkan email Anda.");
    
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Terima kasih. Kami akan mengabari Anda.");
      setEmail("");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col items-center justify-center p-8">
      <Toaster position="top-center" />


      {/* Hero Content */}
      <main className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
            Coming Soon.
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Situs resmi Norvine sedang dalam pengembangan. <br />
            Daftarkan email Anda untuk info peluncuran perdana.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="email" 
            placeholder="Alamat Email" 
            className="w-full h-12 px-0 text-center bg-transparent border-b border-zinc-200 focus:border-emerald-600 outline-none transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            disabled={isLoading}
            className="w-full h-12 text-xs font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors disabled:opacity-30"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Notify Me"}
          </button>
        </form>
      </main>

      {/* Footer Minimalis */}
      <footer className="mt-24">
        <div className="flex gap-8 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          <a href="mailto:support@norvine.com" className="hover:text-zinc-900 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}