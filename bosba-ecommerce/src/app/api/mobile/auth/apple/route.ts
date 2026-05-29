import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// Apple identity token payload (decoded from JWT)
interface ApplePayload {
  sub: string;       // Apple user ID
  email?: string;
  email_verified?: boolean;
}

function decodeAppleToken(identityToken: string): ApplePayload | null {
  try {
    const payload = identityToken.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { identityToken, name } = await req.json();
  if (!identityToken) return NextResponse.json({ error: "identityToken required" }, { status: 400 });

  const payload = decodeAppleToken(identityToken);
  if (!payload?.sub) return NextResponse.json({ error: "Invalid Apple token" }, { status: 401 });

  // Apple only sends email on first sign-in; subsequent logins only have `sub`
  const appleUserId = payload.sub;
  const email = payload.email;

  // Look up by Apple account first
  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "apple", providerAccountId: appleUserId } },
    include: { user: true },
  });

  let user = existingAccount?.user ?? null;

  if (!user) {
    if (!email) {
      return NextResponse.json({ error: "Email required for first Apple sign-in" }, { status: 400 });
    }
    // Find by email or create
    user = await prisma.user.findUnique({ where: { email } }) ?? null;
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name ?? email.split("@")[0],
          emailVerified: new Date(),
          role: "CUSTOMER",
        },
      });
    } else if (!user.emailVerified) {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
      user = { ...user, emailVerified: new Date() };
    }
    // Link Apple account
    await prisma.account.create({
      data: { userId: user.id, type: "oauth", provider: "apple", providerAccountId: appleUserId },
    });
  }

  const token = await encode({
    token: { id: user.id, email: user.email, name: user.name, role: user.role },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60,
  });

  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, emailVerified: user.emailVerified } });
}
