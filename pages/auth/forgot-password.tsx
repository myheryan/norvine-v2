import  { useState, } from 'react';
import { FiArrowLeft, FiArrowRight, FiCommand } from 'react-icons/fi';

const NorvineForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const nextStep = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 font-sans antialiased text-[#1a1a1a]">
      {/* Container Utama - Super Compact & Sharp */}
      <div className="w-full max-w-[380px] bg-white border border-black/[0.08] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
        
        {/* Top Header / Brand Mark */}
        <div className="pt-8 px-8 flex justify-between items-center">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
            <FiCommand className="text-white text-lg" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">Step 0{step} / 03</span>
        </div>

        <div className="p-8 pt-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight mb-1">
              {step === 1 && "Reset Access"}
              {step === 2 && "Verification"}
              {step === 3 && "Secure Account"}
            </h1>
            <p className="text-xs text-black/50 leading-relaxed">
              {step === 1 && "Enter your identity to receive a secure link."}
              {step === 2 && "A 6-digit code has been sent to your inbox."}
              {step === 3 && "Establish a new high-security password."}
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="group transition-all">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-11 bg-[#F9F9FB] border border-black/[0.05] rounded-lg px-4 text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-black/30"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {/* Step 2: OTP - Compact Grid */}
            {step === 2 && (
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-full h-12 bg-[#F9F9FB] border border-black/[0.05] rounded-lg text-center font-bold text-sm focus:border-black focus:bg-white outline-none transition-all"
                  />
                ))}
              </div>
            )}

            {/* Step 3: New Pass */}
            {step === 3 && (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full h-11 bg-[#F9F9FB] border border-black/[0.05] rounded-lg px-4 text-sm focus:border-black focus:bg-white outline-none transition-all"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full h-11 bg-[#F9F9FB] border border-black/[0.05] rounded-lg px-4 text-sm focus:border-black focus:bg-white outline-none transition-all"
                />
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={nextStep}
              className="w-full h-11 bg-black hover:bg-[#222] text-white rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === 3 ? "Complete Reset" : "Continue"}</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="mt-10 pt-6 border-t border-black/[0.03] flex items-center justify-between">
            <a href="/auth/login" className="text-[11px] font-bold text-black/40 hover:text-black flex items-center gap-2 transition-colors uppercase tracking-wider">
              <FiArrowLeft /> Back to login
            </a>
            {step === 2 && (
              <button className="text-[11px] font-bold text-black hover:underline uppercase tracking-wider">
                Resend
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Background Decor - Subtle Branding */}
      <div className="fixed bottom-8 right-8 pointer-events-none opacity-[0.03] select-none">
        <h1 className="text-[120px] font-black leading-none">NORVINE</h1>
      </div>
    </div>
  );
};

export default NorvineForgotPassword;