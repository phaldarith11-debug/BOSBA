import { NextRequest, NextResponse } from "next/server";
import { isAllowedReturnUrl, publicOrigin, signState } from "@/lib/google-mobile-oauth";

// GET /api/mobile/auth/google/start?return_url=<app deep link>
// Redirects the system browser to Google's consent screen. The redirect_uri we
// hand Google is THIS server's HTTPS /callback route — which is why the backend
// must be reachable over public HTTPS (ngrok in dev, your domain in prod).
export async function GET(req: NextRequest) {
  const returnUrl = new URL(req.url).searchParams.get("return_url");
  if (!returnUrl || !isAllowedReturnUrl(returnUrl)) {
    return NextResponse.json({ error: "Missing or invalid return_url" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth is not configured on the server" }, { status: 500 });
  }

  const redirectUri = `${publicOrigin(req)}/api/mobile/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", signState(returnUrl));
  authUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authUrl.toString());
}
