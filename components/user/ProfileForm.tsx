"use client";

import { useState } from "react";
import { useRouter } from "next/router"; // Gunakan next/router untuk Pages Router
import { useSession } from "next-auth/react";
import { Input, Button } from "../ui/baseInput";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const { update } = useSession(); // Fungsi sakti untuk update session tanpa logout
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    birth: user?.birth ? new Date(user.birth).toISOString().split('T')[0] : "",
    phoneNumber: user?.phoneNumber || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // UPDATE SESSION AGAR NAVBAR/SIDEBAR BERUBAH NAMANYA
        await update({ name: formData.name });
        
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        router.replace(router.asPath); 
      } else {
        setMessage({ type: "error", text: "Gagal memperbarui profil." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-6">
      {message && (
        <div className={`p-3 text-sm font-medium rounded-none ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Field form tetap sama seperti kode Anda sebelumnya */}
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-3">
        <Label className="text-zinc-500 sm:text-right text-sm">Email</Label>
        <span className="text-black font-medium text-sm">{user.email}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-3">
        <Label htmlFor="name" className="text-zinc-500 sm:text-right text-sm">Nama Lengkap</Label>
        <Input id="name" value={formData.name} onChange={handleChange} className="rounded-none border-slate-300" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-3">
        <Label htmlFor="birth" className="text-zinc-500 sm:text-right text-sm">Tanggal Lahir</Label>
        <Input id="birth" type="date" value={formData.birth} onChange={handleChange} className="rounded-none border-slate-300" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-3">
        <Label htmlFor="phoneNumber" className="text-zinc-500 sm:text-right text-sm">Nomor Telepon</Label>
        <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="rounded-none border-slate-300" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 pt-2">
        <div />
        <Button type="submit" disabled={isLoading} className="bg-black hover:bg-zinc-800 text-white font-bold h-11 px-10 rounded-none w-max transition-all uppercase text-xs tracking-widest">
          {isLoading ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}