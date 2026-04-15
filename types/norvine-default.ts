// types/norvine-default.d.ts

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  thumbnailUrl: string;
  variantImageUrl?: string;
  weight: number;
  dimensions: Dimensions;
}

export interface ShippingConfig {
  DEFAULT_WEIGHT: number;
  DEFAULT_DIMENSIONS: Dimensions;
  SERVICE_FEE: number;
  INSURANCE_RATE: number; // e.g., 0.002 untuk 0.2%
}

// Global Constants (Bisa diimpor di file mana saja)
export const NORVINE_CONFIG: ShippingConfig = {
  DEFAULT_WEIGHT: 0.1, // dalam kg atau satuan tetap Anda
  DEFAULT_DIMENSIONS: {
    length: 6,
    width: 6,
    height: 12,
  },
  SERVICE_FEE: 1000,
  INSURANCE_RATE: 0.002,
};