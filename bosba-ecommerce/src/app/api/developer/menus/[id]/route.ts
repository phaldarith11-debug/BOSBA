import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";
import { sanitizeMenuItemInput } from "@/lib/menu-validate";

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = sanitizeMenuItemInput(body, { partial: true });

  // Required columns (labelEn, url) must never be cleared to null; nullable ones
  // (labelKm, icon) may be. Only assign keys the caller actually sent.
  const updateData: Prisma.MenuItemUpdateInput = {};
  if (data.labelEn != null) updateData.labelEn = data.labelEn;
  if (data.url != null) updateData.url = data.url;
  if (data.labelKm !== undefined) updateData.labelKm = data.labelKm;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.device !== undefined) updateData.device = data.device;
  if (data.visible !== undefined) updateData.visible = data.visible;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  try {
    const updated = await prisma.menuItem.update({ where: { id: params.id }, data: updateData });
    await writeAudit(session, "update", params.id);
    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    await writeAudit(session, "delete", params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
