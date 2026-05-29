import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary, uploadImage, deleteImage } from "@/lib/cloudinary";

function isStaff(session: any) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "MANAGER" || role === "EDITOR";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "bosba";
  const cursor = searchParams.get("cursor") ?? undefined;

  try {
    const result = await (cloudinary.api as any).resources({
      type: "upload",
      prefix: folder,
      max_results: 48,
      next_cursor: cursor,
      resource_type: "image",
    });

    const assets = result.resources.map((r: any) => ({
      publicId: r.public_id,
      url: r.secure_url,
      format: r.format,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ assets, nextCursor: result.next_cursor ?? null });
  } catch (err) {
    console.error("Cloudinary list error:", err);
    return NextResponse.json({ assets: [], nextCursor: null });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) ?? "bosba/media";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;

  const url = await uploadImage(base64, folder);
  return NextResponse.json({ url });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaff(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await req.json();
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });

  await deleteImage(publicId);
  return NextResponse.json({ success: true });
}

