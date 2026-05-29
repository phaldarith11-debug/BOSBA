import {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import { translations, LOCALES } from "../i18n";
import type { Locale, TranslationSchema } from "../i18n";

const STORAGE_KEY = "bosba_locale";

function detectDeviceLocale(): Locale {
  const tag = Localization.getLocales()?.[0]?.languageTag ?? "en";
  if (tag.startsWith("km")) return "km";
  if (tag.startsWith("ja")) return "ja";
  if (tag.startsWith("zh")) return "zh";
  return "en";
}

type I18nContextType = {
  locale: Locale;
  t: TranslationSchema;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: translations.en,
  setLocale: () => {},
  isLoading: true,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => {
        const valid = LOCALES.find((l) => l.locale === saved);
        setLocaleState(valid ? (saved as Locale) : detectDeviceLocale());
      })
      .catch(() => setLocaleState(detectDeviceLocale()))
      .finally(() => setIsLoading(false));
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {});
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export { LOCALES };
export type { Locale };
