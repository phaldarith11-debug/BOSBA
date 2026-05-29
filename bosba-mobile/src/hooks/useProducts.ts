import { useState, useEffect } from "react";
import { getProducts } from "../lib/api";
import type { Product } from "../types";

interface UseProductsOptions {
  category?: string;
  search?: string;
  featured?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (options.category) params.category = options.category;
    if (options.search)   params.search   = options.search;
    if (options.featured) params.featured  = "true";

    getProducts(params)
      .then((data: { products?: Product[] } | Product[]) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data.products ?? []);
        setProducts(list);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [options.category, options.search, options.featured]);

  return { products, loading, error };
}
