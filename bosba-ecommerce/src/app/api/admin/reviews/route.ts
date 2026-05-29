import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isStaff(session: any) {
  const role = session?.user?.role;
  return ["ADMIN", "MANAGER", "EDITOR"].includes(role ?? "");
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "pending";

  const where =
    filter === "pending" ? { approved: false } :
    filter === "approved" ? { approved: true } : {};

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { nameEn: true, slug: true } },
    },
  });
  return NextResponse.json(reviews);
}

