import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { Eye, EyeOff, ShieldCheck, Lock, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui/baseInput'; 
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { GetServerSideProps } from 'next';

interface ResetPasswordProps {
  token: string;
  isValid: boolean;
}

const ResetPasswordPage = ({ token, isValid }: ResetPasswordProps) => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const [showPass, setShowPass] = useState({ new: false, confirm: false });
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [strength, setStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ 
    type: null, 
    msg: '' 
  });

  // Proteksi sesi aktif
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      signOut({ redirect: false });
    }
  }, [sessionStatus]);

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswords((prev) => ({ ...prev, [id]: value }));
    if (id === 'new') checkStrength(value);
    if (status.type) setStatus({ type: null, msg: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', msg: 'Konfirmasi kata sandi tidak sesuai' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: passwords.new }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mengubah kata sandi');

      setStatus({ type: 'success', msg: 'Berhasil! Kata sandi telah diperbarui.' });
      setTimeout(() => router.push('/login'), 2500);
    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans text-black">
      <main className="w-full max-w-[500px]">
        <div className="bg-white rounded-none border border-zinc-200 overflow-hidden shadow-none">
          
          {/* Header Section */}
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-3">
            <Lock size={18} className="text-black" />
            <h2 className="text-lg font-black text-black tracking-tighter italic">Atur Sandi Baru</h2>
          </div>

          <div className="p-6 md:p-10">
            {!isValid ? (
              /* Tampilan Jika Token Tidak Valid */
              <div className="text-center py-4 space-y-4">
                <div className="flex justify-center text-zinc-300">
                  <XCircle size={48} strokeWidth={1} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm">Tautan Kadaluwarsa</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Tautan ini sudah tidak berlaku atau salah. Silakan minta tautan baru untuk melanjutkan.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-semibold h-11"
                >
                  Minta Link Baru
                </Button>
              </div>
            ) : (
              /* Tampilan Form Reset */
              <>
                {status.type && (
                  <div className={cn(
                    "mb-6 p-3 flex items-center gap-3 text-[11px] font-bold tracking-wider",
                    status.type === 'success' ? "bg-black text-white" : "bg-red-50 text-red-600 border border-red-100"
                  )}>
                    {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {status.msg}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                  {/* Trik mematikan autofill */}
                  <input type="text" name="prevent_autofill" className="hidden" tabIndex={-1} aria-hidden="true" />

                  <div className="space-y-2">
                    <Label htmlFor="new" className="text-zinc-500 text-sm font-semibold">Sandi Baru</Label>
                    <div className="relative w-full">
                      <Input 
                        id="new" 
                        value={passwords.new} 
                        type={showPass.new ? "text" : "password"} 
                        autoComplete="new-password"
                        className="rounded-none border-zinc-300 pr-12 h-10 text-xs shadow-none" 
                        placeholder="Minimal 8 karakter" 
                        onChange={handleInputChange} 
                        disabled={isLoading} 
                      />
                      <button type="button" onClick={() => setShowPass(p => ({...p, new: !p.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors">
                        {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    {/* Strength Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div key={s} className={cn("flex-1 transition-all duration-500", strength >= s ? (strength <= 2 ? 'bg-orange-400' : 'bg-black') : 'bg-zinc-100')} />
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-400 italic leading-tight">Gunakan minimal 8 karakter dengan kombinasi huruf besar, angka, dan simbol.</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-zinc-50 pt-4">
                    <Label htmlFor="confirm" className="text-zinc-500 text-sm font-semibold">Konfirmasi Sandi</Label>
                    <Input 
                      id="confirm" 
                      value={passwords.confirm} 
                      type="password" 
                      autoComplete="new-password"
                      className={cn(
                        "rounded-none h-10 text-xs shadow-none", 
                        passwords.confirm && passwords.new !== passwords.confirm ? "border-red-500" : "border-zinc-300"
                      )}
                      placeholder="Ulangi kata sandi baru" 
                      onChange={handleInputChange} 
                      disabled={isLoading} 
                    />
                    {passwords.confirm && passwords.new !== passwords.confirm && (
                      <p className="text-[10px] text-red-500 italic mt-1 font-medium">Kata sandi tidak cocok.</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading || strength < 3 || passwords.new !== passwords.confirm}
                      className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-11 rounded-none text-base font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                      {isLoading ? 'Memproses...' : 'Konfirmasi Perubahan'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;
  if (!token) return { props: { token: '', isValid: false } };

  const user = await prisma.user.findFirst({
    where: {
      resetToken: String(token),
      resetTokenExpiry: { gt: new Date() },
    },
  });

  return {
    props: {
      token: String(token),
      isValid: !!user,
    },
  };
};

export default ResetPasswordPage;