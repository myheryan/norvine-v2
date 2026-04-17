import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui/baseInput' 
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ 
    type: null, 
    msg: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan');

      setStatus({ 
        type: 'success', 
        msg: 'Berhasil! Tautan reset telah dikirim ke email Anda.' 
      });
      setEmail(''); 

    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans text-black">
      <div className="w-full max-w-[450px] bg-white border border-zinc-200 rounded-none overflow-hidden shadow-none">
        
        {/* Header Section - Selaras dengan Password Page */}
        <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-3">
          <Mail size={18} className="text-black" />
          <h2 className="text-lg font-black text-black tracking-tighter italic">Lupa Sandi</h2>
        </div>

        <div className="p-6 md:p-10">
          {/* Inline Notification */}
          {status.type && (
            <div className={cn(
              "mb-6 p-3 flex items-center gap-3 text-[11px] font-bold tracking-wider",
              status.type === 'success' ? "bg-black text-white" : "bg-red-50 text-red-600 border border-red-100"
            )}>
              {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span className="leading-tight">{status.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Trik mematikan popup password browser */}
            <input type="text" name="prevent_autofill" className="hidden" tabIndex={-1} aria-hidden="true" />
            <input type="password" name="password_fake" className="hidden" tabIndex={-1} aria-hidden="true" />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-500 text-sm font-semibold">
                Alamat Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email terdaftar"
                  className="rounded-none border-zinc-300 h-10 text-xs pl-10 shadow-none focus-visible:ring-black"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              </div>
              <p className="text-[10px] text-zinc-400 italic mt-1 leading-tight font-medium">
                Tautan pengaturan ulang kata sandi akan dikirimkan ke email ini.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-11 rounded-none text-base font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-none"
              >
                {isLoading ? <Loader2 className="animate-spin" size={14} /> : "Kirim Link Reset"}
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-5 border-t border-zinc-50 flex justify-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-black transition-colors"
            >
              <ArrowLeft size={12} />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;