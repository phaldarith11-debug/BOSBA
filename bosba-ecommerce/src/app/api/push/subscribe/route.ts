import { NextResponse } from "next/server";

// Push subscription endpoint — scaffolding only.
//
// Push is disabled until VAPID keys are configured. When a client posts a
// subscription, we validate the shape and acknowledge it, but we do NOT persist
// or send anything yet (no paid service is turned on). Wiring persistence later
// only requires adding a PushSubscription model and saving `sub` below.
export async function POST(request: Request) {
  if (!process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { ok: false, enabled: false, message: "Push notifications are not enabled yet." },
      { status: 501 }
    );
  }

  let sub: unknown;
  try {
    sub = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const endpoint = (sub as { endpoint?: unknown })?.endpoint;
  if (typeof endpoint !== "string" || !endpoint.startsWith("http")) {
    return NextResponse.json({ ok: false, message: "Invalid subscription." }, { status: 400 });
  }

  // TODO(push): persist `sub` against the current user/device when push ships.
  return NextResponse.json({ ok: true, enabled: true });
}
