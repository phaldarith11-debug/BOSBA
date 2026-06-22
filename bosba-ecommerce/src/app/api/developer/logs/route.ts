import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireArea } from "@/lib/authz-server";

/**
 * Combined system log viewer: structured SystemLog rows plus the existing
 * AuditLog trail, merged newest-first. Read-only.
 */
export async function GET(req: NextRequest) {
  const session = await requireArea("developer");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const level = new URL(req.url).searchParams.get("level"); // info | warn | error

  const [logs, audits] = await Promise.all([
    prisma.systemLog.findMany({
      where: level ? { level } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    level && level !== "info"
      ? Promise.resolve([])
      : prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  const merged = [
    ...logs.map((l) => ({
      id: l.id, level: l.level, source: l.source ?? "system",
      message: l.message, createdAt: l.createdAt,
    })),
    ...audits.map((a) => ({
      id: a.id, level: "audit", source: a.resource,
      message: `${a.action}${a.resourceId ? ` (${a.resourceId})` : ""}`, createdAt: a.createdAt,
    })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 150);

  return NextResponse.json({ logs: merged });
}
