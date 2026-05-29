import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ unverified: false });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true, password: true },
  });

  // Only flag as unverified if it's a credentials user (has password) and hasn't verified
  const unverified = !!(user && user.password && !user.emailVerified);
  return NextResponse.json({ unverified });
}
