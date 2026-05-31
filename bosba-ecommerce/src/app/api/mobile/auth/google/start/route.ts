import { NextRequest, NextResponse } from "next/server";
import {
  isAllowedReturnUrl,
  isGoogleSafeRedirect,
  publicOrigin,
  signState,
} from "@/lib/google-mobile-oauth";

// Shown when the redirect_uri would be a private LAN IP / non-HTTPS host, which
// Google rejects. Returning this HTML (instead of redirecting) means the user
// sees actionable steps in the in-app browser rather than Google's 400 page.
function misconfiguredPage(redirectUri: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Google sign-in not configured</title></head>
<body style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:28px;color:#0f172a;line-height:1.5">
  <h2 style="color:#e51b1b;margin:0 0 8px">⚠️ Google sign-in needs a public HTTPS URL</h2>
  <p>Google blocks OAuth redirects to a private LAN IP:</p>
  <code style="display:block;background:#f1f5f9;padding:10px;border-radius:8px;word-break:break-all">${redirectUri}</code>
  <p><b>Fix it (development):</b></p>
  <ol style="padding-left:18px">
    <li>Expose the backend over HTTPS:<br><code>cd bosba-ecommerce &amp;&amp; npx ngrok http 3000</code></li>
    <li>Copy the <code>https://….ngrok-free.app</code> URL.</li>
    <li>In Google Cloud Console → Credentials → your <b>Web</b> client → <b>Authorized redirect URIs</b>, add:<br>
      <code>https://&lt;your-ngrok&gt;.ngrok-free.app/api/mobile/auth/google/callback</code></li>
    <li>In <code>bosba-mobile/.env</code> set:<br><code>EXPO_PUBLIC_PUBLIC_URL=https://&lt;your-ngrok&gt;.ngrok-free.app</code></li>
    <li>Restart Expo: <code>npx expo start -c</code></li>
  </ol>
  <p style="color:#64748b;font-size:13px">Email/password login works without this. You can close this window.</p>
</body></html>`;
}

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

  // Google rejects private-IP / http redirect URIs ("device_id and device_name
  // are required for private IP"). Catch it here with clear instructions instead
  // of handing the user Google's cryptic 400.
  if (!isGoogleSafeRedirect(redirectUri)) {
    return new NextResponse(misconfiguredPage(redirectUri), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", signState(returnUrl));
  authUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authUrl.toString());
}
