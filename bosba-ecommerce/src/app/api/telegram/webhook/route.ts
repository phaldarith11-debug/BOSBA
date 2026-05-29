import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

// Telegram sends POST to this URL when a user messages the bot.
// Set it via: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<SITE_URL>/api/telegram/webhook
// Secured by TELEGRAM_WEBHOOK_SECRET to reject spoofed calls.

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = String(message.chat?.id);
  const text: string = message.text ?? "";

  // /start <userId>  — links the Telegram account to the BOSBA user
  if (text.startsWith("/start")) {
    const parts = text.trim().split(/\s+/);
    const userId = parts[1];

    if (!userId) {
      await sendTelegramMessage(
        "👋 Welcome to BOSBA!\n\nTo link your account, go to your profile on the BOSBA website and tap <b>Link Telegram</b>.",
        chatId
      );
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await sendTelegramMessage("❌ Link expired or invalid. Please try again from the website.", chatId);
      return NextResponse.json({ ok: true });
    }

    // Check if this chatId is already linked to a different account
    const existing = await prisma.user.findFirst({ where: { telegramChatId: chatId } });
    if (existing && existing.id !== userId) {
      await sendTelegramMessage("⚠️ This Telegram account is already linked to a different BOSBA account.", chatId);
      return NextResponse.json({ ok: true });
    }

    await prisma.user.update({ where: { id: userId }, data: { telegramChatId: chatId } });

    await sendTelegramMessage(
      `✅ <b>Telegram linked successfully!</b>\n\nHi ${user.name ?? "there"} 👋\n\nYou'll now receive order updates here automatically.`,
      chatId
    );
    return NextResponse.json({ ok: true });
  }

  // Unknown command
  await sendTelegramMessage(
    "Hi! I'm the BOSBA bot. I send order notifications.\n\nLink your account at <b>My Profile → Link Telegram</b> on the website.",
    chatId
  );
  return NextResponse.json({ ok: true });
}
