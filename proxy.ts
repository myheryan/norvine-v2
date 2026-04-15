import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const pagesUnderMaintenance = ["/cart", "/checkout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Pengecekan Maintenance (Prioritas Tertinggi)
  // Taruh di paling atas agar user tidak perlu login dulu hanya untuk melihat halaman maintenance
  const isMaintenanceActive = process.env.ENABLE_CART_MAINTENANCE === 'true';
  const isTargetingMaintenancePage = pagesUnderMaintenance.some(page => pathname.startsWith(page));

  if (isMaintenanceActive && isTargetingMaintenancePage) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Ambil token untuk pengecekan Auth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isCheckoutPage = pathname.startsWith("/checkout");

  // 2. Proteksi Halaman Auth (Login/Register)
  // Sudah login → tidak boleh ke login/register, lempar ke home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Proteksi Halaman Checkout
  // Belum login → lempar ke login
  if (isCheckoutPage && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};