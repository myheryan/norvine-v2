import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

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


export const displayPhoneNumber = (phone: string): string => {
  const s = sanitizePhoneNumber(phone);
  const match = s.match(/^(\d{4})(\d{4})(\d{4,5})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return s;
};

export const formatPhoneNumber = (value) => {
  // 1. Ambil hanya digit angka saja
  let digits = value.replace(/\D/g, '');

  // 2. Jika user mencoba menghapus sampai habis, kembalikan kosong atau tetap +62
  if (digits.length === 0) return '';

  // 3. Tangani awalan: jika user ngetik "08..." ubah jadi "628..."
  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  }
  
  // Jika tidak diawali 62 (misal langsung 821), paksa tambahkan 62 di depan
  if (!digits.startsWith('62') && digits.length > 0) {
    digits = '62' + digits;
  }

  // 4. Batasi maksimal 13 digit angka (setelah angka 62)
  // Total digit maksimal: 62 + 13 angka = 15 digits
  const slicedDigits = digits.slice(0, 15);

  // 5. Proses pemformatan: +62 8xx xxxx xxxx
  const countryCode = '+62';
  const rest = slicedDigits.substring(2); // Ambil angka setelah '62'
  
  // Kelompokkan sisa angka per 4 digit
  const parts = rest.match(/.{1,4}/g) || [];
  
  return rest.length > 0 
    ? `${countryCode} ${parts.join(' ')}` 
    : countryCode;
};

export const WeightToGram = (product_weight: any) => {
    return product_weight / 1000;
}