"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  id: string;
  nameEn: string;
  nameKm: string;
  priceUsd: number;
  imageUrl: string;
  slug: string;
  categoryName: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle(item) {
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);
          return {
            items: exists
              ? state.items.filter((i) => i.id !== item.id)
              : [...state.items, item],
          };
        });
      },

      has: (id) => get().items.some((i) => i.id === id),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      count: () => get().items.length,
    }),
    { name: "bosba-wishlist" }
  )
);
