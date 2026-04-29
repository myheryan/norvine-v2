// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { ActionStatus, ShipmentStatus, PaymentStatus } from "@/generated/prisma/enums"; // Pastikan path enum benar

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const replaceSpace = (str: string) => str.replace(/\s/g, '-')

export const slugify = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "") // Hapus karakter spesial
    .replace(/\s+/g, "-")       // Ubah spasi jadi dash (-)
    .trim();
};

export const cleanTitleFlexible = (title: string) => {
  return title.replace(/[^a-zA-Z0-9 \-.]/g, "").replace(/\s+/g, " ").trim();
};

export const formatRp = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const copyToClipboard = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success("Nomor invoice berhasil disalin!", {
    description: text,
    position: "top-center",
  });
};

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export  const formatDateTime = (date: string | Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    })
}

export const getCloudinaryImage = (url, width, height) => {
  if (!url) return '/norvine-logo.png'; 
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_limit/q_auto,f_auto/`);
  }
  
  return url; 
};



export const toLowerCase = (str: string | null | undefined): string => {
  if (!str) return "";
  return str.toLowerCase();
};


export const toTitleCase = (str: string | null | undefined): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


  
// Track Location Maps

export async function geoLocationCode({ lat, lng }: { lat: number; lng: number }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding error: ${data.status}`);
    }

    const components = data.results[0].address_components;

    const getComponent = (types: string[]) => 
      components.find((c: any) => types.every(t => c.types.includes(t)))?.long_name || '';

    return {
      county: getComponent(['administrative_area_level_1']),
      city: getComponent(['administrative_area_level_2']),
      district: getComponent(['administrative_area_level_3']),
      subdistrict: getComponent(['locality']) || getComponent(['administrative_area_level_4']),
    };
  } catch (error) {
    console.error("Failed to fetch address:", error);
    return { county: '', city: '', district: '', subdistrict: '' };
  }
}

export async function nomiReverseGeocode({ lat, lng }: { lat: number; lng: number }) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Norvine-App-V1' // Nominatim mewajibkan User-Agent
      }
    });
    const data = await response.json();
    const addr = data.address;

    return {
      county: addr.state || addr.country || '',
      city: addr.city || addr.town || addr.city_district || '',
      district: addr.village || addr.suburb || '',
      subdistrict: addr.road || addr.city_block || addr.neighbourhood || addr.quarter || '',
    };
  } catch (error) {
    console.error("OSM Geocoding failed:", error);
    return { county: '', city: '', district: '', subdistrict: '' };
  }
}

/**
 * Menghapus semua karakter kecuali angka.
 * Contoh: "0812-3456-7890" -> "081234567890"
 */
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};


export const formatToIndonesianPhone = (phone: string): string => {
  let sanitized = sanitizePhoneNumber(phone);

  if (sanitized.startsWith("0")) {
    sanitized = "62" + sanitized.slice(1);
  }
  
  if (sanitized.startsWith("8")) {
    sanitized = "62" + sanitized;
  }

  return sanitized;
};



export const formatPhoneNumber = (value: any) => {
  let digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';

  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  }
  
  if (!digits.startsWith('62') && digits.length > 0) {
    digits = '62' + digits; // Hapus '+' di sini biar hitungan slice nggak kacau
  }

  const slicedDigits = digits.slice(0, 15);

  const countryCode = '+62';
  const rest = slicedDigits.substring(2); // Ambil angka setelah '62'
  
  if (rest.length === 0) return countryCode;

  // Potong angka dengan format 3 - 4 - 4 - sisanya (kalau ada kepanjangan)
  const part1 = rest.slice(0, 3);
  const part2 = rest.slice(3, 7);
  const part3 = rest.slice(7, 11);
  const part4 = rest.slice(11, 15); 

  // Gabungkan array yang ada isinya (mengabaikan string kosong)
  const parts = [part1, part2, part3, part4].filter(Boolean);
  
  return `${countryCode} ${parts.join(' ')}`;
};

export const weightGramToKg = (product_weight: any): number => {
  const weight = parseFloat(product_weight) || 0;
  const converted = weight / 1000;

  return Number(converted.toFixed(2));
}


export const getStatusColor = (status: ActionStatus | string) => {
  switch (status) {
    case "PENDING":
      return "text-orange-500 bg-orange-50 border-orange-100";
    case "APPROVED":
      return "text-blue-500 bg-blue-50 border-blue-100";
    case "REFUNDED":
      return "text-emerald-500 bg-emerald-50 border-emerald-100";
    case "REJECTED":
      return "text-red-500 bg-red-50 border-red-100";
    default:
      return "text-gray-500 bg-gray-50 border-gray-100";
  }
};

// Bapak juga bisa sekalian buat fungsi untuk Label-nya agar seragam
export const getStatusLabel = (status: ActionStatus | string) => {
  switch (status) {
    case "PENDING": return "Menunggu Verifikasi";
    case "APPROVED": return "Disetujui Admin";
    case "REFUNDED": return "Dana Dikembalikan";
    case "REJECTED": return "Permintaan Ditolak";
    default: return status;
  }
};


export const capitalizeName = (name: string): string => {
  if (!name) return "";
  
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Hanya mengubah huruf paling depan dari seluruh kalimat
 * Contoh: "halo dunia" -> "Halo dunia"
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};


/**
 * Menggabungkan status pembayaran dan pengiriman menjadi satu label yang dimengerti user.
 */
export const displayStatus = (trxStatus: PaymentStatus, shipStatus?: ShipmentStatus | null) => {
  // 1. Cek status pembayaran (Prioritas Utama)
  if (trxStatus === "PENDING") return "Menunggu Pembayaran";
  if (trxStatus === "EXPIRED") return "Pembayaran Kedaluwarsa";
  if (trxStatus === "CANCELLED") return "Pesanan Dibatalkan";
  if (trxStatus === "REFUNDED") return "Dana Dikembalikan";

  // 2. Jika sudah PAID, baru tampilkan status logistik (Shipment)
  if (trxStatus === "PAID") {
    if (!shipStatus) return "Pembayaran Berhasil"; // Fallback jika data shipment belum ke-load

    switch (shipStatus) {
      case "PENDING": return "Pesanan Dibayar (Menunggu Verifikasi)";
      case "PROCESSING": return "Pesanan Sedang Dikemas";
      case "READY_TO_SHIP": return "Siap Dikirim";
      case "SHIPPED": return "Dalam Pengiriman";
      case "DELIVERED": return "Pesanan Selesai";
      case "FAILED": return "Gagal Dikirim";
      default: return "Diproses";
    }
  }

  return "Status Tidak Diketahui";
};

