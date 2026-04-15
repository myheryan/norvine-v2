import React from "react";

// --- REUSABLE INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, icon, ...props }: InputProps) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="px-2 py-3 text-sm font-semibold transition-all">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-black transition-colors">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full h-11 px-4 border border-zinc-200 rounded-lg text-sm focus:border-black outline-none transition-all
            ${icon ? "pl-12 pr-4" : "px-4"}
            ${props.className || ""}
          `}
        />
      </div>
    </div>
  );
};

// --- REUSABLE BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  isLoading?: boolean;
}

export const Button = ({ variant = "primary", isLoading, children, ...props }: ButtonProps) => {
  const baseStyles = "relative px-5 py-2 transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 active:shadow-none";
  
  const variants = {
    primary: "bg-black text-white rounded-md text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm",
    outline: "bg-white text-black border-2 border-black hover:bg-zinc-50 shadow-[6px_6px_0px_rgba(0,0,0,0.05)]"
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${props.className || ""}`}>
      {isLoading ? <span className="animate-spin text-lg">◌</span> : children}
    </button>
  );
};