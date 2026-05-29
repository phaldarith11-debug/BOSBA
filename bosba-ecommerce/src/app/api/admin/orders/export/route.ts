import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function esc(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(from);
    if (to) { const d = new Date(to); d.setHours(23, 59, 59, 999); range.lte = d; }
    where.createdAt = range;
  }
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      address: { select: { fullName: true, phone: true, city: true, province: true } },
      deliveryZone: { select: { nameEn: true } },
      items: { select: { nameEn: true, quantity: true, totalUsd: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const HEADERS = [
    "Order#", "Date", "Customer Name", "Email", "Phone", "City", "Province",
    "Items", "Subtotal USD", "Delivery USD", "Discount USD", "Total USD", "Total KHR",
    "Payment Method", "Payment Status", "Order Status", "Tracking Code", "Delivery Zone",
  ];

  const rows = orders.map((o) => {
    const items = o.items.map((i) => `${i.nameEn} ×${i.quantity}`).join(" | ");
    return [
      o.orderNumber,
      o.createdAt.toISOString().slice(0, 10),
      o.user.name ?? "",
      o.user.email,
      o.address?.phone ?? "",
      o.address?.city ?? "",
      o.address?.province ?? "",
      items,
      Number(o.subtotalUsd).toFixed(2),
      Number(o.deliveryFeeUsd).toFixed(2),
      Number(o.discountUsd).toFixed(2),
      Number(o.totalUsd).toFixed(2),
      o.totalKhr.toString(),
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.trackingCode ?? "",
      o.deliveryZone?.nameEn ?? "",
    ].map(esc).join(",");
  });

  const csv = "﻿" + [HEADERS.join(","), ...rows].join("\r\n");
  const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
