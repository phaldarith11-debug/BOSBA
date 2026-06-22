import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessArea } from "@/lib/authz";

/**
 * Guard for seller-owned API routes. Returns the current user's id (used as the
 * product/payout owner key) when the caller may use the Seller Center, else null.
 *
 * Every seller query MUST be scoped by `sellerId` so a seller can only ever read
 * or mutate their own products, orders, and payouts.
 */
export async function requireSeller(): Promise<{ sellerId: string; role: string } | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || !canAccessArea(user.role, "seller")) return null;
  return { sellerId: user.id, role: user.role ?? "" };
}
