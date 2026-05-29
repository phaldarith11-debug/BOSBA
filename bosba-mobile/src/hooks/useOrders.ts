import { useState, useCallback } from "react";
import { getMobileOrders } from "../lib/api";
import { useAuth } from "../context/auth";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalUsd: number;
  createdAt: string;
  items: Array<{ nameEn: string; quantity: number; imageUrl?: string | null }>;
};

export function useOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMobileOrders(token);
      setOrders(Array.isArray(data) ? data : data.orders ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { orders, loading, error, refetch: load };
}
