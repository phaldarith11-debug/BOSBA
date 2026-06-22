import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";
import { sanitizeSectionInput } from "@/lib/cms-validate";

/**
 * Developer-only CRUD for CMS layout blocks (drafts included). Guarded by the
 * "developer" area (DEVELOPER or ADMIN). The public surfaces never hit this —
 * they read /api/cms/sections, which only exposes published blocks.
 */

export async function GET(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = (new URL(req.url).searchParams.get("page") || "home").slice(0, 60);
  const sections = await prisma.pageSection.findMany({
    where: { page },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ sections });
}

export async function POST(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = sanitizeSectionInput(body, { partial: false });

  // New blocks land at the bottom of their page as drafts.
  const last = await prisma.pageSection.findFirst({
    where: { page: data.page ?? "home" },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const created = await prisma.pageSection.create({
    data: {
      page: data.page ?? "home",
      type: data.type ?? "text",
      titleEn: data.titleEn ?? null,
      titleKm: data.titleKm ?? null,
      subtitleEn: data.subtitleEn ?? null,
      subtitleKm: data.subtitleKm ?? null,
      image: data.image ?? null,
      buttonText: data.buttonText ?? null,
      buttonLink: data.buttonLink ?? null,
      bgColor: data.bgColor ?? null,
      textColor: data.textColor ?? null,
      config: data.config ? (data.config as Prisma.InputJsonValue) : undefined,
      device: data.device ?? "both",
      visible: data.visible ?? true,
      status: "draft",
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  await writeAudit(session, "create", created.id);
  return NextResponse.json({ section: created }, { status: 201 });
}

async function writeAudit(
  session: { user?: { id?: string } },
  action: string,
  resourceId: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: session.user?.id ?? "unknown",
        action: `cms.section.${action}`,
        resource: "PageSection",
        resourceId,
      },
    });
  } catch {
    /* auditing must never block the write */
  }
}
