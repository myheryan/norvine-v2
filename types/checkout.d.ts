// 1. Definisikan Interface di atas komponen atau di luar fungsi
export interface ShippingService {
  service_code: string;
  service_name: string;
  price: number;
  estimasi: string;
}

export interface ShippingData {
  active: boolean;
  services: ShippingService[];
}
