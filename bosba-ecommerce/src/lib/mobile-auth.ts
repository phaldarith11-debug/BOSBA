import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

// Resolve the authenticated user id from a mobile Bearer token.
//
// Mobile session tokens are minted with next-auth `encode({ id, email, name, role })`
// (see /api/mobile/auth/* and lib/google-mobile-oauth.ts), so they MUST be read with
// next-auth `decode` and the `id` claim. The previous per-route helpers used
// `jsonwebtoken.verify(...).sub`, which never matches these tokens and 401'd every
// authenticated mobile request. Centralised here so the two stay in sync.
export async function getMobileUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    const payload = await decode({ token, secret: process.env.NEXTAUTH_SECRET! });
    return (payload?.id as string | undefined) ?? null;
  } catch {
    return null;
  }
}
