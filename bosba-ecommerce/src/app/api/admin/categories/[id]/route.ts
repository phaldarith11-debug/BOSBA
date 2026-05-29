import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { nameEn, nameKm, description, image, parentId } = body;

  const data: Record<string, unknown> = {};
  if (nameEn !== undefined) { data.nameEn = nameEn; data.slug = slugify(nameEn); }
  if (nameKm !== undefined) data.nameKm = nameKm;
  if (description !== undefined) data.description = description;
  if (image !== undefined) data.image = image;
  if (parentId !== undefined) data.parentId = parentId || null;

  const category = await prisma.category.update({ where: { id: params.id }, data });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const count = await prisma.product.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return NextResponse.json({ error: "Cannot delete a category that has products" }, { status: 409 });
  }

  await prisma.category.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
