import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ASSIGNABLE_ROLES, isSuperRole } from "@/lib/authz";
import bcrypt from "bcryptjs";

function canManageUsers(session: unknown) {
  const role = (session as { user?: { role?: string } } | null)?.user?.role;
  return isSuperRole(role);
}

/**
 * PATCH supports three operations (any combination):
 *   { role }        → change role (assign Seller/Developer/etc.)
 *   { active }      → activate / deactivate the account
 *   { password }    → reset password (min 8 chars)
 *   { name }        → rename
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canManageUsers(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, name, active, password } = await req.json();
  const currentUserId = (session?.user as { id?: string })?.id;

  if (role && !(ASSIGNABLE_ROLES as string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  // Don't let an admin lock themselves out.
  if (params.id === currentUserId && role && !isSuperRole(role)) {
    return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
  }
  if (params.id === currentUserId && active === false) {
    return NextResponse.json({ error: "Cannot deactivate yourself" }, { status: 400 });
  }
  if (password !== undefined && (typeof password !== "string" || password.length < 8)) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (role) data.role = role;
  if (name) data.name = name;
  if (typeof active === "boolean") data.active = active;
  if (password) data.password = await bcrypt.hash(password, 12);
  // Assigning the SELLER role to someone with no profile yet creates an empty one.
  if (role === "SELLER") {
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: params.id } });
    if (!existing) data.sellerProfile = { create: {} };
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!canManageUsers(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserId = (session?.user as { id?: string })?.id;
  if (params.id === currentUserId) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  // Demote to CUSTOMER instead of deleting (preserve order history)
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role: "CUSTOMER" },
    select: { id: true },
  });
  return NextResponse.json({ success: true, id: user.id });
}
