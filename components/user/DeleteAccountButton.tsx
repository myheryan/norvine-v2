// src/components/users/DeleteAccountButton.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteAccountButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus akun");

      toast.success("Akun berhasil dihapus. Selamat tinggal!");
      
      // Logout dan lempar ke homepage instan (tanpa layar hitam)
      signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error("Gagal menghapus akun. Silakan coba lagi.");
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-3">
        <div className="flex gap-2 text-red-700 font-semibold items-center">
          <AlertTriangle className="h-5 w-5" />
          <p>Tindakan ini tidak dapat dibatalkan!</p>
        </div>
        <p className="text-sm text-red-600">
          Semua data pesanan, keranjang, dan profil Anda akan dihapus permanen. Apakah Anda benar-benar yakin?
        </p>
        <div className="flex gap-3 pt-2">
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Ya, Hapus Permanen"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsConfirming(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant="destructive" 
      onClick={() => setIsConfirming(true)}
      className="gap-2"
    >
      <Trash2 className="h-4 w-4" />
      Hapus Akun Saya
    </Button>
  );
}