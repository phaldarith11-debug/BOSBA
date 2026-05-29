import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, nameKm: true, email: true, phone: true, image: true, emailVerified: true, role: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, nameKm, phone, image } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(nameKm !== undefined && { nameKm }),
      ...(phone !== undefined && { phone }),
      ...(image !== undefined && { image }),
    },
    select: { id: true, name: true, nameKm: true, email: true, phone: true, image: true, emailVerified: true },
  });

  return NextResponse.json(user);
}
