import crypto from "crypto";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// ── Shared helpers for the mobile server-side Google OAuth flow ─────────────────
//
// The mobile app opens /api/mobile/auth/google/start in a system browser. That
// endpoint redirects to Google with an HTTPS redirect_uri (the /callback route),
// which is what a Google "Web" OAuth client requires. After Google returns, the
// callback exchanges the code, provisions the user, mints a session token, and
// 302-redirects back into the app via its deep-link scheme (exp:// or bosba://).
// This works in Expo Go (unlike the native exp:// redirect Google rejects).

const SECRET = process.env.NEXTAUTH_SECRET ?? "change-me";
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
// Schemes we are willing to 302 the browser back to. Prevents the callback from
// being abused as an open redirect to an arbitrary http(s) site.
const ALLOWED_RETURN_SCHEMES = ["exp", "exps", "bosba"];

export function isAllowedReturnUrl(url: string): boolean {
  const scheme = url.split(":", 1)[0]?.toLowerCase();
  return !!scheme && ALLOWED_RETURN_SCHEMES.includes(scheme);
}

/** Sign the app's return URL into a tamper-proof, time-limited `state` value. */
export function signState(returnUrl: string): string {
  const payload = Buffer.from(JSON.stringify({ r: returnUrl, t: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyState(state: string): { returnUrl: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const { r, t } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof r !== "string" || typeof t !== "number") return null;
    if (Date.now() - t > STATE_TTL_MS) return null;
    if (!isAllowedReturnUrl(r)) return null;
    return { returnUrl: r };
  } catch {
    return null;
  }
}

/** Public origin as seen by the client (honours the ngrok/reverse-proxy headers). */
export function publicOrigin(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

/**
 * Google only allows OAuth redirect URIs that are HTTPS, or HTTP on the loopback
 * host (localhost / 127.0.0.1). It rejects private LAN IPs (192.168.x, 10.x,
 * 172.16–31.x) with "device_id and device_name are required for private IP".
 * We detect that BEFORE bouncing the browser to Google so we can show a clear,
 * actionable error instead of Google's cryptic one.
 */
export function isGoogleSafeRedirect(redirectUri: string): boolean {
  try {
    const u = new URL(redirectUri);
    if (u.protocol === "https:") return true;
    if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return true;
    return false;
  } catch {
    return false;
  }
}

export type GoogleUserInfo = { sub: string; email?: string; name?: string; picture?: string };

/**
 * Find-or-create the user for a verified Google identity, link the Google account,
 * and return a next-auth session token compatible with /api/mobile/auth/me.
 * Shared by the redirect callback and the legacy accessToken POST endpoint.
 */
export async function issueGoogleSession(info: GoogleUserInfo) {
  if (!info.email) throw new Error("No email from Google");

  let user = await prisma.user.findUnique({ where: { email: info.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: info.email,
        name: info.name ?? null,
        image: info.picture ?? null,
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  }

  const existing = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: info.sub } },
  });
  if (!existing) {
    await prisma.account.create({
      data: { userId: user.id, type: "oauth", provider: "google", providerAccountId: info.sub },
    });
  }

  const token = await encode({
    token: { id: user.id, email: user.email, name: user.name, role: user.role },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}
