import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: otp },
  });

  if (!record) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  return NextResponse.json({ ok: true });
}
