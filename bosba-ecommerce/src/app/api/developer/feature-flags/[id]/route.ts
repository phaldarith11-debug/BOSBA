import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof b.enabled === "boolean") data.enabled = b.enabled;
  if (b.description !== undefined) data.description = (b.description as string) || null;
  if (typeof b.rollout === "number") data.rollout = Math.max(0, Math.min(100, b.rollout));

  const flag = await prisma.featureFlag.update({ where: { id: params.id }, data });
  return NextResponse.json({ flag });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.featureFlag.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
