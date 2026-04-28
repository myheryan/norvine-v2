// components/auth/SessionGuard.tsx
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      // Hanya jalankan jika user sedang login
      if (status === "authenticated" && session?.user) {
        try {
          const res = await fetch("/api/auth/check-session");
          
          if (res.status === 403 || res.status === 401) {
            // Jika user dihapus dari DB atau session tidak valid
            await signOut({ 
              callbackUrl: "/auth/login?error=SessionInvalid",
              redirect: true 
            });
          }
        } catch (error) {
          console.error("Gagal memvalidasi sesi");
        }
      }
    };

    // Jalankan validasi setiap kali navigasi selesai (pindah halaman)
    if (status !== "loading") {
      validateSession();
    }
  }, [router.asPath, status, session]);

  return <>{children}</>;
}