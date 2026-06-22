import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ASSIGNABLE_ROLES, STAFF_ROLES, isSuperRole } from "@/lib/authz";
import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Only OWNER/ADMIN may manage users. */
function canManageUsers(session: unknown) {
  const role = (session as { user?: { role?: string } } | null)?.user?.role;
  return isSuperRole(role);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!canManageUsers(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES as Role[] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true, role: true, image: true, active: true,
      createdAt: true, emailVerified: true,
    },
  });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageUsers(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: "name, email, password and role are required" }, { status: 400 });
  }
  if (!(ASSIGNABLE_ROLES as string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name, email, password: hashed, role,
      emailVerified: new Date(),
      active: true,
      // Give SELLER accounts an empty business profile to fill in.
      ...(role === "SELLER" && { sellerProfile: { create: {} } }),
    },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
