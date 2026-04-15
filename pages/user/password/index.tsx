import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/baseInput'; // Sesuaikan path Button Anda
import { Input } from '@/components/ui/baseInput';   // Sesuaikan path Input Anda
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const EnterprisePasswordPage = () => {
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [strength, setStrength] = useState(0);

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswords({ ...passwords, [id]: value });
    if (id === 'new') checkStrength(value);
  };

  return (
    <div className="container max-w-[1200px] md:py-10">
      <main className="flex-1 min-w-0 w-full">
        
        {/* Wrapper Utama Norvine Style */}
        <div className="bg-white rounded-none overflow-hidden">
          
          {/* Header Section */}
          <div className="p-3 bg-sky-50 border-b border-zinc-100">
            <div className="flex items-center gap-3 mb-1">
              <Lock size={20} className="text-black" />
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                Ubah Kata Sandi
              </h2>
            </div>
          </div>
          <div className="p-6">
                        <p className="text-zinc-500 text-sm leading-relaxed">
              Demi keamanan akun, mohon tidak menyebarkan kata sandi Anda ke orang lain.
            </p>
          </div>

          <form className="p-6 md:p-10 space-y-3" onSubmit={(e) => e.preventDefault()}>
            
            {/* Kata Sandi Lama */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2 md:gap-8">
              <Label htmlFor="old" className="text-zinc-500 md:text-right font-bold uppercase text-[11px] tracking-wider">
                Kata Sandi Saat Ini
              </Label>
              <div className="relative max-w-xl">
                <Input
                  id="old"
                  type={showPass.old ? "text" : "password"}
                  className="rounded-none border-slate-300 pr-12 h-11 focus-visible:ring-black"
                  placeholder="Masukkan kata sandi lama"
                  onChange={handleInputChange}
                />
                <button 
                  type="button"
                  onClick={() => setShowPass({...showPass, old: !showPass.old})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPass.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <hr className="border-slate-100 max-w-4xl" />

            {/* Kata Sandi Baru */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-start gap-2 md:gap-8">
              <Label htmlFor="new" className="text-zinc-500 md:text-right font-bold uppercase text-[11px] tracking-wider pt-3">
                Kata Sandi Baru
              </Label>
              <div className="space-y-3 max-w-xl w-full">
                <div className="relative">
                  <Input
                    id="new"
                    type={showPass.new ? "text" : "password"}
                    className="rounded-none border-slate-300 pr-12 h-11 focus-visible:ring-black"
                    placeholder="Minimal 8 karakter"
                    onChange={handleInputChange}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass({...showPass, new: !showPass.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                  >
                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Strength Meter */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1 flex-1 transition-all duration-500 ${
                          strength >= step 
                            ? (strength <= 2 ? 'bg-orange-400' : 'bg-black') 
                            : 'bg-zinc-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight italic">
                    Gunakan minimal 8 karakter dengan kombinasi huruf besar, angka, dan simbol.
                  </p>
                </div>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2 md:gap-8">
              <Label htmlFor="confirm" className="text-zinc-500 md:text-right font-bold uppercase text-[11px] tracking-wider">
                Konfirmasi Sandi
              </Label>
              <div className="max-w-xl">
                <Input
                  id="confirm"
                  type="password"
                  className={cn(
                    "rounded-none h-11 focus-visible:ring-black",
                    passwords.confirm && passwords.new !== passwords.confirm 
                    ? "border-red-500 focus-visible:ring-red-500" 
                    : "border-slate-300"
                  )}
                  placeholder="Ulangi kata sandi baru"
                  onChange={handleInputChange}
                />
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium">Kata sandi tidak cocok.</p>
                )}
              </div>
            </div>

            {/* Submit Button Area */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 pt-4">
              <div />
              <Button
                type="submit"
                className="bg-black hover:bg-zinc-800 text-white font-bold h-12 px-10 rounded-none w-full md:w-max shadow-none transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                Konfirmasi Perubahan
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EnterprisePasswordPage;