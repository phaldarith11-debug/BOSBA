import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";
import { sanitizeSectionInput } from "@/lib/cms-validate";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { config, ...rest } = sanitizeSectionInput(body, { partial: true });

  const updateData: Prisma.PageSectionUpdateInput = { ...rest };
  // Only touch the JSON column when the caller actually sent `config`.
  if ("config" in body) {
    updateData.config = config ? (config as Prisma.InputJsonValue) : Prisma.JsonNull;
  }

  try {
    const updated = await prisma.pageSection.update({
      where: { id: params.id },
      data: updateData,
    });
    await writeAudit(session, "update", params.id);
    return NextResponse.json({ section: updated });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.pageSection.delete({ where: { id: params.id } });
    await writeAudit(session, "delete", params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
