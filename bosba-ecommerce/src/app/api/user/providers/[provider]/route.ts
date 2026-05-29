import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { provider } = params;

  const [allAccounts, user] = await Promise.all([
    prisma.account.findMany({ where: { userId }, select: { provider: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { password: true } }),
  ]);

  const hasOtherLogin = allAccounts.length > 1 || !!user?.password;
  if (!hasOtherLogin) {
    return NextResponse.json(
      { error: "Cannot remove your only login method. Set a password first." },
      { status: 400 }
    );
  }

  await prisma.account.deleteMany({ where: { userId, provider } });
  return NextResponse.json({ ok: true });
}
