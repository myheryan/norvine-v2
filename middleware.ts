// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const protectedPages = ["/checkout", "/user", "/orders"]; 
const authPages = ["/login", "/register", "/auth/login", "/auth/register"];
const pagesUnderMaintenance = ["/cart", "/checkout"];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // A. Cek jika ada flag error dari API (misal user didelete dari DB)
  // Jika URL mengandung ?error=SessionInvalid, kita paksa bersihkan cookie
  if (searchParams.get("error") === "SessionInvalid") {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    // Hapus session secara paksa dari cookie browser
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("next-auth.callback-url");
    return response;
  }

  // 1. Pengecekan Maintenance
  const isMaintenanceActive = process.env.ENABLE_CART_MAINTENANCE === 'true';
  const isTargetingMaintenancePage = pagesUnderMaintenance.some(page => pathname.startsWith(page));

  if (isMaintenanceActive && isTargetingMaintenancePage) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));

  // 2. Proteksi Balik (Sudah Login -> Jangan buka Login page)
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Proteksi Halaman Terlindungi (Belum Login -> Ke Login page)
  if (!token && isProtectedPage) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};