import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";
import { sanitizeMenuItemInput } from "@/lib/menu-validate";
import { isMenuLocation } from "@/lib/menu-blocks";

/**
 * Developer-only CRUD for navigation menus (drafts included). Guarded by the
 * "developer" area. Items are scoped to a Menu (one per location); the Menu row
 * is created on demand the first time an item is added to a location.
 */

async function writeAudit(session: { user?: { id?: string } }, action: string, resourceId: string) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: session.user?.id ?? "unknown",
        action: `cms.menuItem.${action}`,
        resource: "MenuItem",
        resourceId,
      },
    });
  } catch {
    /* auditing must never block the write */
  }
}

export async function GET(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const location = new URL(req.url).searchParams.get("location") || "header";
  if (!isMenuLocation(location)) {
    return NextResponse.json({ error: "Unknown location" }, { status: 400 });
  }

  const menu = await prisma.menu.findUnique({
    where: { location },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ location, items: menu?.items ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const location = typeof body.location === "string" ? body.location : "header";
  if (!isMenuLocation(location)) {
    return NextResponse.json({ error: "Unknown location" }, { status: 400 });
  }

  // Find-or-create the menu for this location.
  const menu = await prisma.menu.upsert({
    where: { location },
    update: {},
    create: { location },
  });

  const data = sanitizeMenuItemInput(body, { partial: false });
  const last = await prisma.menuItem.findFirst({
    where: { menuId: menu.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const created = await prisma.menuItem.create({
    data: {
      menuId: menu.id,
      labelEn: data.labelEn ?? "Untitled",
      labelKm: data.labelKm ?? null,
      url: data.url ?? "/",
      icon: data.icon ?? null,
      device: data.device ?? "both",
      visible: data.visible ?? true,
      status: "draft",
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  await writeAudit(session, "create", created.id);
  return NextResponse.json({ item: created }, { status: 201 });
}
