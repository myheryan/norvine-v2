import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  // Jika kamu butuh ID di JWT token juga
  interface JWT {
    id: string
  }
}