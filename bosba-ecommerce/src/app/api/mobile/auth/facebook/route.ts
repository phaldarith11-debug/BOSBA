import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken) return NextResponse.json({ error: "accessToken required" }, { status: 400 });

  const res = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
  );
  if (!res.ok) return NextResponse.json({ error: "Invalid Facebook token" }, { status: 401 });

  const info = await res.json() as { id: string; name: string; email?: string; picture?: { data?: { url?: string } } };
  const email = info.email;
  if (!email) return NextResponse.json({ error: "Facebook account has no email" }, { status: 400 });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: info.name,
        image: info.picture?.data?.url ?? null,
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  }

  const existing = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "facebook", providerAccountId: info.id } },
  });
  if (!existing) {
    await prisma.account.create({
      data: { userId: user.id, type: "oauth", provider: "facebook", providerAccountId: info.id },
    });
  }

  const token = await encode({
    token: { id: user.id, email: user.email, name: user.name, role: user.role },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60,
  });

  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, emailVerified: user.emailVerified } });
}
