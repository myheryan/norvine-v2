import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; 
import { PrismaAdapter } from "@next-auth/prisma-adapter"; 
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendWelcomeMail } from "@/lib/mail-service";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // PENTING: Mengizinkan link email otomatis jika user sudah daftar via Credentials
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? "USER", 
        };
      },
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Akun tidak ditemukan atau silakan login via Google");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Password salah");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!(profile as any)?.email_verified) {
          throw new Error("Email Google Anda belum terverifikasi.");
        }
      }
      return true;
    },
      
    async jwt({ token, user, trigger, session }) {
      // 1. Saat Login Pertama Kali
      if (user) {
        token.id = user.id; // Kunci: Simpan ID ke Token
        token.role = (user as any).role;
        token.picture = user.image; 
      }
      
      // 2. Saat memanggil useSession().update()
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.role) token.role = session.role;
        // JANGAN hapus token.id di sini
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        // KIRIM ID DARI TOKEN KE SESSION
        (session.user as any).id = token.id; 
        (session.user as any).role = token.role;
        session.user.image = token.picture as string;
        session.user.name = token.name;
      }
      return session;
    }
},

  // --- SEMUA EVENT NEXTAUTH (LENGKAP) ---
  events: {
    // 1. Dijalankan saat user pertama kali dibuat di Database (Registration)
    async createUser({ user }) {
      if (user.email) {
        await sendWelcomeMail(user.email, user.name || "User");
        // Logika tambahan: Memberi role default atau kirim diskon pertama
        console.log(`[EVENT: CREATE_USER] Akun baru dibuat: ${user.email}`);
      }
    },

    // 2. Dijalankan saat akun (Google/GitHub) dihubungkan ke profil user
    async linkAccount({ user, account }) {
      console.log(`[EVENT: LINK_ACCOUNT] Akun ${account.provider} dihubungkan ke ${user.email}`);
      // Di sini Anda bisa memverifikasi otomatis email jika provider-nya Google
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    },

    // 3. Dijalankan setiap kali user berhasil Login
    async signIn({ user, account, isNewUser }) {
      const date = new Date().toLocaleString('id-ID');
      console.log(`[EVENT: SIGN_IN] User ${user.email} login via ${account?.provider} pada ${date}`);
      
       await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    },

    // 4. Dijalankan saat user logout (Session berakhir)
    async signOut({ session, token }) {
      console.log(`[EVENT: SIGN_OUT] User ${token.email} telah keluar.`);
    },

    // 5. Dijalankan saat data user diupdate di database
    async updateUser({ user }) {
      console.log(`[EVENT: UPDATE_USER] Data user ${user.email} telah diperbarui.`);
    },

    // 6. Dijalankan saat session aktif (berguna untuk audit/logging)
    async session({ session, token }) {
      // console.log(`[EVENT: SESSION] Session aktif untuk ${session.user?.email}`);
    }
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // <--- Pastikan file ini ada untuk handle redirect_uri_mismatch
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);