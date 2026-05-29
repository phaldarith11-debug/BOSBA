import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require an authenticated session
const PRIVATE_PATHS = ["/profile", "/account"];

function isPrivatePath(pathname: string): boolean {
  // Strip optional locale prefix (e.g. /km/profile → /profile)
  const stripped = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
  return PRIVATE_PATHS.some((p) => stripped === p || stripped.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ──────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAdmin = token && (token as { role?: string }).role === "ADMIN";

    if (pathname === "/admin/login") {
      if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.next();
    }

    if (!isAdmin) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ── API routes — no i18n ──────────────────────────────────
  if (pathname.startsWith("/api")) return NextResponse.next();

  // ── Private shop routes — require login ───────────────────
  if (isPrivatePath(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Shop / auth routes — i18n ─────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)" ],
};
