import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ASSIGNABLE_ROLES } from "@/lib/authz";

function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, name } = await req.json();
  const currentUserId = (session?.user as { id?: string })?.id;

  if (role && !(ASSIGNABLE_ROLES as string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (params.id === currentUserId && role && role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(role && { role }),
      ...(name && { name }),
    },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
