import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken) return NextResponse.json({ error: "accessToken required" }, { status: 400 });

  // Validate with Google
  const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });

  const info = await res.json() as { sub: string; email: string; name: string; picture?: string };
  if (!info.email) return NextResponse.json({ error: "No email from Google" }, { status: 400 });

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: info.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: info.email,
        name: info.name,
        image: info.picture ?? null,
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  }

  // Link Google account if not already linked
  const existing = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: info.sub } },
  });
  if (!existing) {
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: info.sub,
      },
    });
  }

  const token = await encode({
    token: { id: user.id, email: user.email, name: user.name, role: user.role },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60,
  });

  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, emailVerified: user.emailVerified } });
}
