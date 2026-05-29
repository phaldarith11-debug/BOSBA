import type { Metadata } from "next";
import { Inter, Battambang, Noto_Sans_JP, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "../providers";
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

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as Locale;
  const meta = LOCALE_META[locale] ?? LOCALE_META.en;

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://bosba.com";

  return {
    title: { default: meta.title, template: `%s | BOSBA` },
    description: meta.description,
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

  return (
    <html
      lang={meta.lang}
      className={`${inter.variable} ${battambang.variable} ${notoSansJP.variable} ${notoSansSC.variable}`}
    >
      <body className={FONT_CLASS[locale as Locale] ?? inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
