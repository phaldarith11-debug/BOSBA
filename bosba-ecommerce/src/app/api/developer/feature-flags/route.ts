import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";

export async function GET() {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ flags });
}

export async function POST(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const key = String(b.key ?? "").trim().toLowerCase().replace(/\s+/g, "_").slice(0, 60);
  if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });
  if (await prisma.featureFlag.findUnique({ where: { key } })) {
    return NextResponse.json({ error: "Flag already exists" }, { status: 409 });
  }

  const flag = await prisma.featureFlag.create({
    data: {
      key,
      enabled: b.enabled === true,
      description: (b.description as string) || null,
    },
  });
  return NextResponse.json({ flag }, { status: 201 });
}
