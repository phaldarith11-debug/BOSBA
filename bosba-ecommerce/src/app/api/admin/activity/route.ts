import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!["ADMIN", "MANAGER"].includes(role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 50;
  const resource = searchParams.get("resource") ?? undefined;

  const where = resource ? { resource } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Enrich with admin names
  const adminIds = Array.from(new Set(logs.map((l: any) => l.adminId)));
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true },
  });
  const adminMap = Object.fromEntries(admins.map((a) => [a.id, a]));

  const enriched = logs.map((log: any) => ({
    ...log,
    admin: adminMap[log.adminId] ?? { name: "Unknown", email: "" },
  }));

  return NextResponse.json({ logs: enriched, total, page, pages: Math.ceil(total / limit) });
}
