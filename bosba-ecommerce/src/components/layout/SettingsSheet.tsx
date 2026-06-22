"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition, useState } from "react";
import { X, Check, Globe, Coins } from "lucide-react";
import { useCurrencyStore } from "@/store/currency";

type Locale = "en" | "km" | "ja" | "zh";

const LANGUAGES: { locale: Locale; flag: string; nativeName: string; font: string }[] = [
  { locale: "en", flag: "🇬🇧", nativeName: "English",    font: "" },
  { locale: "km", flag: "🇰🇭", nativeName: "ភាសាខ្មែរ",  font: "font-khmer" },
  { locale: "ja", flag: "🇯🇵", nativeName: "日本語",      font: "font-japanese" },
  { locale: "zh", flag: "🇨🇳", nativeName: "中文",        font: "font-chinese" },
];

const CURRENCIES: { value: "USD" | "KHR"; label: string; symbol: string; hint: string }[] = [
  { value: "USD", label: "US Dollar",     symbol: "$", hint: "USD" },
  { value: "KHR", label: "Khmer Riel",    symbol: "៛", hint: "KHR" },
];

/**
 * Native-style bottom sheet for language + currency.  Replaces the old inline
 * dropdown that overlapped the page on small screens.  Renders through a portal
 * so it always sits above the header / tab bar, and respects the iPhone home
 * indicator via `pb-safe`.
 */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { currency, setCurrency } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll + close on Escape while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  function switchLocale(next: Locale) {
    if (next === locale) return;
    startTransition(() => router.replace(pathname, { locale: next }));
  }

  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={t("settings")}>
      {/* Scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
      />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 animate-sheet-up rounded-t-3xl bg-white pb-safe shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
        {/* Grab handle */}
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-base font-bold text-gray-900">{t("settings")}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="tap-target -mr-2 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 pb-6">
          {/* Language */}
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Globe className="h-3.5 w-3.5" />
              {t("language")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const active = lang.locale === locale;
                return (
                  <button
                    key={lang.locale}
                    onClick={() => switchLocale(lang.locale)}
                    disabled={isPending}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] disabled:opacity-60 ${
                      active
                        ? "border-brand-300 bg-brand-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl leading-none">{lang.flag}</span>
                    <span className={`flex-1 text-sm font-semibold text-gray-800 ${lang.font}`}>
                      {lang.nativeName}
                    </span>
                    {active && <Check className="h-4 w-4 flex-shrink-0 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Coins className="h-3.5 w-3.5" />
              {t("currency")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCIES.map((c) => {
                const active = c.value === currency;
                return (
                  <button
                    key={c.value}
                    onClick={() => setCurrency(c.value)}
                    aria-pressed={active}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
                      active
                        ? "border-brand-300 bg-brand-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                        active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.symbol}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-gray-800">{c.hint}</span>
                      <span className="block text-xs text-gray-400">{c.label}</span>
                    </span>
                    {active && <Check className="h-4 w-4 flex-shrink-0 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white active:scale-[0.99]"
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
