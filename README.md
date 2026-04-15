# Norvine Official Website (norvine.co.id) 💊🌿

Selamat datang di repositori resmi untuk website **Norvine** (norvine.co.id). Norvine adalah brand suplemen dan vitamin terpercaya yang berkomitmen untuk menyediakan produk kesehatan berkualitas tinggi bagi masyarakat Indonesia.

Website ini berfungsi sebagai Company Profile, katalog produk, platform verifikasi keaslian produk (Product Verification), serta portal informasi untuk promo dan daftar mitra apotek resmi.

---

## 🚀 Fitur Utama

1. **Katalog Produk Dinamis**: Menampilkan daftar lengkap produk Norvine (vitamin, suplemen, minoxidil, dll) dengan detail komposisi, dosis, peringatan, dan efek samping menggunakan antarmuka accordion yang rapi.
2. **Sistem Verifikasi Produk (Anti-Pemalsuan)**: Pelanggan dapat memasukkan Serial Number (Hologram) untuk memverifikasi keaslian produk Norvine yang mereka beli.
3. **Halaman Promo & Loyalty Program**: Menampilkan penawaran terbaru, kode voucher yang bisa disalin (*Copy to Clipboard*), dan informasi program loyalitas.
4. **Pencari Mitra Apotek (Find Us)**: Direktori interaktif yang sangat *compact* untuk mencari apotek terdekat yang menjual produk Norvine, lengkap dengan fitur pencarian cerdas per kota dan integrasi Google Maps.
5. **Keranjang Belanja (Cart) UI**: Antarmuka keranjang belanja bergaya e-commerce modern dengan fitur *select/unselect*, penyesuaian kuantitas stok, dan ringkasan harga (Saat ini disimulasikan sebagai UI Mockup).
6. **Desain Ultra-Responsif**: Dioptimalkan secara sempurna untuk tampilan Desktop (*Wide*) dan Mobile (*Smartphone*) menggunakan pendekatan desain khusus per perangkat (`<Desktop>` dan `<Mobile>`).

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan *stack* teknologi modern untuk memastikan performa yang cepat, SEO yang baik, dan skalabilitas:

* **Framework**: [Next.js](https://nextjs.org/) (React Framework)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/)
* **Animasi & Interaksi**: 
  * `react-collapsible` (Untuk Accordion Detail Produk)
  * `react-icons` (Untuk Ikonografi)
  * `react-is-visible` (Untuk mendeteksi elemen saat di-scroll)
* **State Management**: React Hooks (`useState`, `useMemo`, `useEffect`, `useContext`)
* **Routing**: Next.js Router (`useRouter`)

---

## 📂 Struktur Direktori Utama

* `pages/` - Berisi semua rute halaman (contoh: `index.tsx`, `promo.tsx`, `cart.tsx`, `find-us.tsx`).
* `components/` - Kumpulan komponen UI yang dapat digunakan kembali (contoh: `Desktop.tsx`, `Mobile.tsx`, `NavBar.tsx`, dll).
* `public/` - Aset statis seperti gambar logo, *mockup* produk, dan ikon (*assets* seperti `tiktok-logo.png`, `halodoc-logo.png`).
* `constants/` - Berisi data statis/dummy seperti `product.ts` (mapping data produk Norvine).
* `context/` - Konfigurasi React Context (contoh: `NavbarContext` untuk mengatur warna navbar).

---

## 💻 Cara Menjalankan Proyek secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan website ini di komputer lokal Anda:

### Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18.x atau yang lebih baru) dan pengelola paket seperti **npm** atau **yarn**.

### Langkah-langkah

1. **Clone Repositori**
   ```bash
   git clone [https://github.com/username-anda/norvine.co.id.git](https://github.com/username-anda/norvine.co.id.git)
   cd norvine.co.id