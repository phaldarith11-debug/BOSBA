export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameKm: string;
  descriptionEn: string | null;
  descriptionKm: string | null;
  priceUsd: number;
  priceKhr: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  featured: boolean;
  category: {
    id: string;
    nameEn: string;
    nameKm: string;
    slug: string;
  };
}

export interface CartItem {
  productId: string;
  nameEn: string;
  nameKm: string;
  priceUsd: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}
