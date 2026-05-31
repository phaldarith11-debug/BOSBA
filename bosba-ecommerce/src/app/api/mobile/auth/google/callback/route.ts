import { NextRequest, NextResponse } from "next/server";
import { issueGoogleSession, publicOrigin, verifyState, type GoogleUserInfo } from "@/lib/google-mobile-oauth";

// Redirect the browser back INTO the app (custom scheme). Uses a manual 302 so
// non-http(s) schemes like exp:// and bosba:// are preserved.
function backToApp(returnUrl: string, params: Record<string, string>): NextResponse {
  const sep = returnUrl.includes("?") ? "&" : "?";
  const qs = new URLSearchParams(params).toString();
  return new NextResponse(null, { status: 302, headers: { Location: `${returnUrl}${sep}${qs}` } });
}

// Shown only when we can't trust the state and therefore don't know where to return.
function htmlError(message: string): NextResponse {
  return new NextResponse(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<body style="font-family:system-ui;padding:32px;text-align:center;color:#0f172a">` +
      `<h2>Sign-in failed</h2><p>${message}</p>` +
      `<p>Please return to the app and try again.</p></body>`,
    { status: 400, headers: { "Content-Type": "text/html" } }
  );
}

// GET /api/mobile/auth/google/callback?code=...&state=...
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const state = params.get("state");

  const verified = state ? verifyState(state) : null;
  if (!verified) {
    return htmlError("Your sign-in session expired or could not be verified.");
  }
  const { returnUrl } = verified;

  const googleError = params.get("error");
  const code = params.get("code");
  if (googleError || !code) {
    return backToApp(returnUrl, { error: googleError ?? "no_code" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return backToApp(returnUrl, { error: "server_not_configured" });
  }

  const redirectUri = `${publicOrigin(req)}/api/mobile/auth/google/callback`;

  try {
    // Exchange the authorization code for tokens.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return backToApp(returnUrl, { error: "token_exchange_failed" });
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) return backToApp(returnUrl, { error: "no_access_token" });

    // Resolve the Google profile.
    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!infoRes.ok) return backToApp(returnUrl, { error: "userinfo_failed" });
    const info = (await infoRes.json()) as GoogleUserInfo;

    const { token } = await issueGoogleSession(info);
    return backToApp(returnUrl, { token });
  } catch {
    return backToApp(returnUrl, { error: "server_error" });
  }
}
