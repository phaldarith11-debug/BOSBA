"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition, useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type Locale = "en" | "km" | "ja" | "zh";

const LANGUAGES: { locale: Locale; label: string; flag: string; nativeName: string }[] = [
  { locale: "en", label: "English",    flag: "🇬🇧", nativeName: "English" },
  { locale: "km", label: "Khmer",      flag: "🇰🇭", nativeName: "ភាសាខ្មែរ" },
  { locale: "ja", label: "Japanese",   flag: "🇯🇵", nativeName: "日本語" },
  { locale: "zh", label: "Chinese",    flag: "🇨🇳", nativeName: "中文" },
];

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.locale === locale) ?? LANGUAGES[0];

  function switchLocale(next: Locale) {
    if (next === locale) { setOpen(false); return; }
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className={`
          flex items-center gap-1.5 text-xs font-semibold
          border border-gray-200 rounded-full px-3 py-1.5
          hover:bg-gray-50 hover:border-gray-300
          transition-all duration-200
          disabled:opacity-50
          ${open ? "bg-gray-50 border-gray-300" : ""}
        `}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className={`hidden sm:block ${locale === "km" ? "font-khmer" : locale === "ja" ? "font-japanese" : locale === "zh" ? "font-chinese" : ""}`}>
          {current.nativeName}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className="
            absolute right-0 top-full mt-2 min-w-[160px]
            bg-white rounded-2xl shadow-popup border border-gray-100/80
            py-1.5 z-50
            animate-scale-in origin-top-right
          "
        >
          {LANGUAGES.map((lang) => {
            const active = lang.locale === locale;
            return (
              <button
                key={lang.locale}
                role="option"
                aria-selected={active}
                onClick={() => switchLocale(lang.locale)}
                className={`
                  flex items-center gap-3 w-full px-4 py-2.5
                  text-sm transition-colors duration-150
                  ${active
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className="text-base leading-none flex-shrink-0">{lang.flag}</span>
                <span className={`flex-1 text-left ${
                  lang.locale === "km" ? "font-khmer" :
                  lang.locale === "ja" ? "font-japanese" :
                  lang.locale === "zh" ? "font-chinese" : ""
                }`}>
                  {lang.nativeName}
                </span>
                {active && (
                  <span className="ml-auto text-brand-600 text-[10px] font-bold bg-brand-100 rounded-full px-1.5 py-0.5">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 rounded-full bg-white/60 flex items-center justify-center pointer-events-none">
          <div className="h-3 w-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
