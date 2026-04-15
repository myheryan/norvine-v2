import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // Wajib menggunakan strategi JWT jika menggunakan CredentialsProvider
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Hari
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // PENTING: Mengizinkan penggabungan akun jika email sama antara Google & Credentials
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Proteksi: Jika user tidak ditemukan atau user tersebut mendaftar via Google
        // (User Google biasanya tidak punya password di DB)
        if (!user || !user.password) {
          throw new Error("Akun tidak ditemukan atau silakan masuk melalui Google");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Email atau password salah");
        }

        return user;
      },
    }),
  ],

  callbacks: {
    // 1. SIGN IN CALLBACK: Filter keamanan awal
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Cek jika email dari Google sudah terverifikasi
        const isEmailVerified = (profile as any)?.email_verified;
        if (!isEmailVerified) {
          throw new Error("Email Google Anda belum terverifikasi.");
        }
        return true;
      }
      return true;
    },

    // 2. JWT CALLBACK: Menitipkan data ke token (Server Side)
    async jwt({ token, user, trigger, session }) {
      // 'user' hanya tersedia saat login pertama kali
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      
      // Sinkronisasi jika ada update profil manual (via useSession().update())
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      return token;
    },

    // 3. SESSION CALLBACK: Melempar data ke Frontend (Client Side)
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  events: {
    // Memastikan field emailVerified di DB terisi saat user baru dibuat via Google
    async createUser({ user }: any) {
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },

  pages: {
    signIn: "/auth/login", // Halaman login kustom Norvine
    error: "/auth/error",   // Halaman error kustom Norvine
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  // Set ke TRUE di local dev untuk melihat log detail di terminal jika Google Login error
  debug: process.env.NODE_ENV === "development",
};