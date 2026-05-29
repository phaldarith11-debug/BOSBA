import type { Role, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export type Currency = "USD" | "KHR";

export type { Role, OrderStatus, PaymentMethod, PaymentStatus };

export interface CartItem {
  id: string;
  productId: string;
  nameEn: string;
  nameKm: string;
  priceUsd: number;
  priceKhr: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

export interface ProductWithCategory {
  id: string;
  nameEn: string;
  nameKm: string;
  slug: string;
  descriptionEn?: string | null;
  descriptionKm?: string | null;
  priceUsd: number;
  priceKhr: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  category: { id: string; nameEn: string; nameKm: string; slug: string };
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  deliveryZoneId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  saveAddress?: boolean;
}
