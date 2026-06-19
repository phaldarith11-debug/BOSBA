import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ASSIGNABLE_ROLES, STAFF_ROLES } from "@/lib/authz";
import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES as Role[] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true, role: true, image: true,
      createdAt: true, emailVerified: true,
    },
  });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: "name, email, password and role are required" }, { status: 400 });
  }
  if (!(ASSIGNABLE_ROLES as string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name, email, password: hashed, role,
      emailVerified: new Date(),
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}

