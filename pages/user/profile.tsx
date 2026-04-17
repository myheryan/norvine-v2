import { useState, useRef } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/baseInput";
import ProfileForm from "@/components/user/ProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { CgProfile } from "react-icons/cg";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) return { redirect: { destination: "/auth/login", permanent: false } };
  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  return { props: { user: JSON.parse(JSON.stringify(user)) } };
}

export default function ProfilePage({ user }: { user: any }) {
  const { update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "user-profile"); // Ganti ini

    try {
      // 1. Upload ke Cloudinary
      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dwgffqtli/image/upload", {
        method: "POST",
        body: formData,
      });
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      // 2. Patch ke API Profile kita (Hanya update foto)
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (res.ok) {
        // 3. UPDATE SESSION AGAR SIDEBAR BERUBAH FOTONYA INSTAN
        await update({ image: imageUrl });
        router.replace(router.asPath);
      }
    } catch (err) {
      alert("Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto md:py-10 max-w-[1200px]">
      <div className="bg-white rounded-none border border-zinc-200 overflow-hidden shadow-none">
        <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-3">
          <CgProfile size={18} className="text-black" />
          <h2 className="text-lg font-black tracking-tight">Profil Saya</h2>
        </div>
        <div className="p-6 md:p-10 flex flex-col-reverse lg:flex-row gap-12 lg:gap-20">
          <ProfileForm user={user} />
          
          <div className="flex flex-col items-center lg:w-[220px] lg:border-l border-zinc-100 lg:pl-10">
            <Avatar className="h-32 w-32 border border-zinc-200 mb-6 rounded-none overflow-hidden relative group">
              <AvatarImage src={user?.image || ""} className="object-cover" />
              <AvatarFallback className="text-4xl font-bold bg-zinc-100 text-zinc-400">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold text-black uppercase tracking-tighter">
                  Uploading...
                </div>
              )}
            </Avatar>
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="font-bold w-full max-w-[160px] rounded-none border-black text-black hover:bg-black hover:text-white h-10 transition-all uppercase text-xs tracking-widest"
            >
              Pilih Gambar
            </Button>
            <p className="text-[10px] text-zinc-400 mt-4 text-center">Format: .JPG, .PNG. Maks 1MB.</p>
          </div>
        </div>
      </div>
    </div>
  );
}