import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [accounts, user] = await Promise.all([
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true, providerAccountId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    }),
  ]);

  return NextResponse.json({
    providers: accounts.map((a) => a.provider),
    hasPassword: !!user?.password,
  });
}
