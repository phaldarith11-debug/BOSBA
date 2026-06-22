import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";
import { ALL_SETTING_KEYS } from "@/lib/setting-registry";

/**
 * Developer-only read/write for the whitelisted CMS settings keys. Any key not
 * in the registry is rejected, so this endpoint can never write arbitrary rows.
 */
export async function GET() {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await prisma.settings.findMany({
    where: { key: { in: Array.from(ALL_SETTING_KEYS) } },
  });
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export async function PUT(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const entries = Object.entries(body).filter(([key]) => ALL_SETTING_KEYS.has(key));
  if (entries.length === 0) return NextResponse.json({ error: "No valid settings to update" }, { status: 400 });

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value ?? "") },
        create: { key, value: String(value ?? "") },
      })
    )
  );

  // Best-effort audit entry.
  try {
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id?: string })?.id ?? "unknown",
        action: "cms.settings.update",
        resource: "Settings",
        resourceId: entries.map(([k]) => k).join(","),
      },
    });
  } catch { /* never block the write */ }

  return NextResponse.json({ updated: entries.length });
}
