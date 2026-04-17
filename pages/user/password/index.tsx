import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';   
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const EnterprisePasswordPage = () => {
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [strength, setStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

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
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mengubah kata sandi');
      setStatus({ type: 'success', msg: 'Berhasil! Kata sandi telah diperbarui.' });
      setPasswords({ old: '', new: '', confirm: '' });
      setStrength(0);
    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-[1000px] md:py-6">
      <main className="w-full">
        <div className="bg-white rounded-none border border-zinc-200 overflow-hidden shadow-none">
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-3">
            <Lock size={18} className="text-black" />
            <h2 className="text-lg font-black text-black tracking-tighter">Ubah Kata Sandi</h2>
          </div>
          <div className="px-6 py-2 border-b border-zinc-50">
            <p className="text-zinc-400 text-[11px]">Demi keamanan akun, mohon tidak menyebarkan kata sandi Anda ke orang lain.</p>
          </div>

          {status.type && (
            <div className={cn("mx-6 mt-4 p-3 flex items-center gap-3 text-[11px] font-bold tracking-wider", 
              status.type === 'success' ? "bg-black text-white" : "bg-red-50 text-red-600 border border-red-100")}>
              {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {status.msg}
            </div>
          )}

          <form className="p-6 md:p-8 space-y-3" onSubmit={handleSubmit} autoComplete="off">
            {/* Trik mematikan autofill browser: input tersembunyi */}
            <input type="text" name="username" className="hidden" aria-hidden="true" />
            <input type="password" name="password" className="hidden" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-2 md:gap-4">
              <Label htmlFor="old" className="text-zinc-500 md:text-right text-sm font-semibold">Sandi Saat Ini</Label>
              <div className="relative max-w-lg">
                <Input id="old" value={passwords.old} type={showPass.old ? "text" : "password"} autoComplete="one-time-code"
                  className="rounded-none border-zinc-300 pr-12 h-10 focus-visible:ring-black text-xs" 
                  placeholder="Masukkan kata sandi lama" onChange={handleInputChange} disabled={isLoading} />
                <button type="button" onClick={() => setShowPass(p => ({...p, old: !p.old}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                  {showPass.old ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <hr className="border-zinc-100 max-w-lg md:ml-[180px]" />

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-2 md:gap-4 pt-1">
              <Label htmlFor="new" className="text-zinc-500 md:text-right text-sm font-semibold pt-3">Sandi Baru</Label>
              <div className="space-y-2 max-w-lg w-full">
                <div className="relative">
                  <Input id="new" value={passwords.new} type={showPass.new ? "text" : "password"} autoComplete="new-password"
                    className="rounded-none border-zinc-300 pr-12 h-10 focus-visible:ring-black text-xs" 
                    placeholder="Minimal 8 karakter" onChange={handleInputChange} disabled={isLoading} />
                  <button type="button" onClick={() => setShowPass(p => ({...p, new: !p.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                    {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className={cn("flex-1 transition-all duration-500", strength >= s ? (strength <= 2 ? 'bg-orange-400' : 'bg-black') : 'bg-zinc-100')} />
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">Gunakan minimal 8 karakter dengan kombinasi huruf besar, angka, dan simbol.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-2 md:gap-4">
              <Label htmlFor="confirm" className="text-zinc-500 md:text-right text-sm font-semibold">Konfirmasi</Label>
              <div className="max-w-lg">
                <Input id="confirm" value={passwords.confirm} type="password" autoComplete="new-password"
                  className={cn("rounded-none h-10 focus-visible:ring-black text-xs", passwords.confirm && passwords.new !== passwords.confirm ? "border-red-500" : "border-zinc-300")}
                  placeholder="Ulangi kata sandi baru" onChange={handleInputChange} disabled={isLoading} />
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium italic">Kata sandi tidak cocok.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 pt-4">
              <div />
              <Button type="submit" disabled={isLoading || strength < 3 || passwords.new !== passwords.confirm}
                className="bg-black hover:bg-zinc-800 text-white font-bold h-11 px-8 rounded-none w-full md:w-max text-base font-semibold flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                {isLoading ? 'Memproses...' : 'Konfirmasi Perubahan'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EnterprisePasswordPage;