"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/types";

interface CurrencyStore {
  currency: Currency;
  rate: number;
  setCurrency: (currency: Currency) => void;
  setRate: (rate: number) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: "USD",
      rate: parseInt(process.env.NEXT_PUBLIC_KHR_RATE ?? "4100"),
      setCurrency: (currency) => set({ currency }),
      setRate: (rate) => set({ rate }),
    }),
    { name: "bosba-currency" }
  )
);
