import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_KEYS = [
  "brand_name",
  "brand_logo",
  "primary_color",
  "secondary_color",
  "announcement_en",
  "announcement_km",
  "site_phone",
  "site_email",
  "social_facebook",
  "social_instagram",
  "social_telegram",
  "homepage_hero_title_en",
  "homepage_hero_title_km",
  "homepage_hero_subtitle_en",
  "homepage_hero_subtitle_km",
  "usd_khr_rate",
  "free_delivery_over_usd",
  // Shared design + launch behaviour so the Expo app matches the PWA.
  "font_family",
  "radius_scale",
  "splash_tagline",
  "pwa_splash_enabled",
  "onboarding_enabled",
  // Manual ABA / KHQR receiving details (public merchant info, never the API key)
  "aba_account_name",
  "aba_account_number",
  "aba_khqr_image",
  "aba_payment_instructions",
];

export async function GET() {
  const records = await prisma.settings.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });

  const settings = Object.fromEntries(records.map((r) => [r.key, r.value]));

  return NextResponse.json(settings, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
