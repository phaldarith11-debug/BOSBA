import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, active: true },
    include: { category: true, variants: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const data = await req.json();
  const product = await prisma.product.update({
    where: { slug: params.slug },
    data,
    include: { category: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  await prisma.product.update({ where: { slug: params.slug }, data: { active: false } });
  return NextResponse.json({ success: true });
}
