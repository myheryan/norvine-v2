import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Daftar halaman yang wajib LOGIN (Session-based)
const protectedPages = ["/checkout", "/user", "/orders"]; 
// Daftar halaman yang TIDAK BOLEH diakses jika sudah login
const authPages = ["/login", "/register", "/auth/login", "/auth/register"];
// Daftar halaman maintenance
const pagesUnderMaintenance = ["/cart", "/checkout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Pengecekan Maintenance (Prioritas Tertinggi)
  const isMaintenanceActive = process.env.ENABLE_CART_MAINTENANCE === 'true';
  const isTargetingMaintenancePage = pagesUnderMaintenance.some(page => pathname.startsWith(page));

  if (isMaintenanceActive && isTargetingMaintenancePage) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Ambil token untuk pengecekan Session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));

  // 2. Proteksi Balik (Halaman Login/Register)
  // JIKA user sudah LOGIN (token ada) DAN mencoba buka halaman AUTH
  if (token && isAuthPage) {
    // Tendang ke Home karena mereka sudah login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Proteksi Halaman Session (User Dashboard, Checkout, dll)
  // JIKA user BELUM login (token null) DAN mencoba buka halaman PROTECTED
  if (!token && isProtectedPage) {
    const loginUrl = new URL("/auth/login", request.url);
    // Simpan lokasi terakhir agar setelah login balik lagi ke sini
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Daftar ini berarti: JALANKAN Middleware KECUALI untuk:
     * 1. api (karena API punya validasi sendiri)
     * 2. _next/static (file CSS/JS internal Next.js)
     * 3. _next/image (optimasi gambar Next.js)
     * 4. favicon.ico & semua file di folder public (gambar produk, dll)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};