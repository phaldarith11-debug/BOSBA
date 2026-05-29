/** Coerce Prisma Decimal fields (serialised as strings) to JS numbers. */
export function normalizeProduct<T extends { priceUsd: any; priceKhr?: any; comparePrice?: any }>(p: T): T {
  return {
    ...p,
    priceUsd:     Number(p.priceUsd),
    priceKhr:     p.priceKhr != null ? Number(p.priceKhr) : p.priceKhr,
    comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
  };
}

export function relativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function formatUsd(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

export function formatKhr(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")} ៛`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}
