import type { Metadata, Viewport } from "next";
import { Inter, Battambang, Noto_Sans_JP, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "../providers";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { getSiteSettings } from "@/lib/site-settings";
import { getSettingsMap } from "@/lib/dev-settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";
import { getPwaSettings } from "@/lib/pwa-settings";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AppSplash } from "@/components/AppSplash";
import { Onboarding } from "@/components/Onboarding";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const battambang = Battambang({
  subsets: ["khmer", "latin"],
  weight: ["400", "700"],
  variable: "--font-khmer",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jp",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zh",
  display: "swap",
});

type Locale = (typeof routing.locales)[number];

const LOCALE_META: Record<Locale, { lang: string; title: string; description: string }> = {
  en: {
    lang: "en",
    title: "BOSBA - Cambodia's Online Store",
    description: "Shop quality products with KHR & USD pricing. Delivery across Cambodia.",
  },
  km: {
    lang: "km",
    title: "BOSBA - ហាងអនឡាញនៃកម្ពុជា",
    description: "ទិញផលិតផលល្អប្រណីតជាមួយនឹងតម្លៃ KHR និង USD ។ ដឹកដំណើរទូទាំងប្រទេសកម្ពុជា",
  },
  ja: {
    lang: "ja",
    title: "BOSBA - カンボジアのオンラインショップ",
    description: "KHR・USDで買える高品質商品。カンボジア全土配送。",
  },
  zh: {
    lang: "zh-Hans",
    title: "BOSBA - 柬埔寨网上商店",
    description: "高品质商品，支持 KHR 和 USD 支付，全柬埔寨配送。",
  },
};

// Theme color follows the dashboard-configured PWA color so the browser/OS
// chrome matches the installed app. Lives in viewport per Next 14 conventions.
export async function generateViewport(): Promise<Viewport> {
  const pwa = await getPwaSettings();
  return {
    themeColor: pwa.themeColor,
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as Locale;
  const meta = LOCALE_META[locale] ?? LOCALE_META.en;

  // Canonical/OG base URL. Prefer explicit env, then Vercel's injected host, so
  // SEO tags point at the live domain even if NEXTAUTH_URL hasn't been set yet.
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://bosbadrinksnack.vercel.app");
  const pwa = await getPwaSettings();

  return {
    title: { default: meta.title, template: `%s | BOSBA` },
    description: meta.description,
    applicationName: pwa.appName,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: pwa.shortName,
    },
    icons: {
      icon: [
        { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        en: baseUrl,
        km: `${baseUrl}/km`,
        ja: `${baseUrl}/ja`,
        zh: `${baseUrl}/zh`,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      type: "website",
      locale: meta.lang,
      siteName: "BOSBA",
    },
  };
}

const FONT_CLASS: Record<Locale, string> = {
  en: inter.className,
  km: battambang.className,
  ja: notoSansJP.className,
  zh: notoSansSC.className,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const meta = LOCALE_META[locale as Locale] ?? LOCALE_META.en;

  // Brand identity from the dashboard CMS (controls website + mobile alike).
  const site = await getSiteSettings();
  const brandVars = [
    site.primaryColor ? `--brand-primary:${site.primaryColor};` : "",
    site.secondaryColor ? `--brand-secondary:${site.secondaryColor};` : "",
  ].join("");

  // Maintenance mode: shoppers see a holding screen; staff keep full access so
  // they can still browse/test the live site while it's "off" to the public.
  const settingsMap = await getSettingsMap();
  if (settingsMap.maintenance_mode === "true") {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    const STAFF = ["OWNER", "ADMIN", "MANAGER", "EDITOR", "STAFF", "VIEWER", "SELLER", "DEVELOPER"];
    const isStaff = !!role && STAFF.includes(role);
    if (!isStaff) {
      const msg = locale === "km"
        ? settingsMap.maintenance_message_km || settingsMap.maintenance_message_en
        : settingsMap.maintenance_message_en;
      return (
        <html lang={meta.lang} className={`${inter.variable} ${battambang.variable}`}>
          <body className={FONT_CLASS[locale as Locale] ?? inter.className}>
            <MaintenanceScreen brandName={site.brandName} message={msg} />
          </body>
        </html>
      );
    }
  }

  return (
    <html
      lang={meta.lang}
      className={`${inter.variable} ${battambang.variable} ${notoSansJP.variable} ${notoSansSC.variable}`}
    >
      <body className={FONT_CLASS[locale as Locale] ?? inter.className}>
        {/* Override brand color tokens from the dashboard (loaded after globals.css). */}
        {brandVars && <style dangerouslySetInnerHTML={{ __html: `:root{${brandVars}}` }} />}
        <NextIntlClientProvider messages={messages}>
          <SiteSettingsProvider value={site}>
            <Providers>{children}</Providers>
            <AppSplash />
            <Onboarding />
            <InstallPrompt />
          </SiteSettingsProvider>
        </NextIntlClientProvider>
        <PWARegister />
      </body>
    </html>
  );
}
