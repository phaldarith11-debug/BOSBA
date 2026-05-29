import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramChatId: true },
  });

  const botName = process.env.TELEGRAM_BOT_NAME;
  const deepLink = botName
    ? `https://t.me/${botName}?start=${session.user.id}`
    : null;

  return NextResponse.json({
    linked: !!user?.telegramChatId,
    deepLink,
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramChatId: null },
  });

  return NextResponse.json({ ok: true });
}
