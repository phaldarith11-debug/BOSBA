import { NextRequest, NextResponse } from "next/server";
import { issueGoogleSession, type GoogleUserInfo } from "@/lib/google-mobile-oauth";

// Legacy / native path: the app sends a Google accessToken obtained client-side.
// (The server-side redirect flow lives in ./start + ./callback.)
export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken) return NextResponse.json({ error: "accessToken required" }, { status: 400 });

  const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });

  const info = (await res.json()) as GoogleUserInfo;
  if (!info.email) return NextResponse.json({ error: "No email from Google" }, { status: 400 });

  const { token, user } = await issueGoogleSession(info);
  return NextResponse.json({ token, user });
}
