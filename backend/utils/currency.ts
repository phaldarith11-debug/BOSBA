export const DEFAULT_RATE = parseInt(process.env.NEXT_PUBLIC_KHR_RATE ?? "4100");

export function usdToKhr(usd: number, rate = DEFAULT_RATE): number {
  return Math.round(usd * rate);
}

export function khrToUsd(khr: number, rate = DEFAULT_RATE): number {
  return Math.round((khr / rate) * 100) / 100;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatKhr(amount: number): string {
  // Deterministic across Node (server) and browser (client): the "km-KH" currency
  // style renders the ៛ symbol on the server but falls back to "KHR" in the
  // browser, causing React hydration mismatches. Group with the universally
  // available en-US locale and append the riel symbol ourselves.
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}៛`;
}

export function formatPrice(usd: number, currency: "USD" | "KHR", rate = DEFAULT_RATE): string {
  return currency === "USD" ? formatUsd(usd) : formatKhr(usdToKhr(usd, rate));
}
