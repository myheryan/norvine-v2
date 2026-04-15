import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" onClick={handleCopy} className="p-2 text-slate-500 hover:text-[#ee4d2d] transition-colors">
      {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
    </button>
  );
}