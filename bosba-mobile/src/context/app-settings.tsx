import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAppSettings } from "../lib/api";

export type AppSettings = {
  brand_name: string;
  brand_logo: string;
  primary_color: string;
  secondary_color: string;
  announcement_en: string;
  announcement_km: string;
  site_phone: string;
  site_email: string;
  social_facebook: string;
  social_instagram: string;
  social_telegram: string;
};

const DEFAULTS: AppSettings = {
  brand_name: "BOSBA",
  brand_logo: "",
  primary_color: "#e51b1b",
  secondary_color: "#0f172a",
  announcement_en: "",
  announcement_km: "",
  site_phone: "",
  site_email: "",
  social_facebook: "",
  social_instagram: "",
  social_telegram: "",
};

const AppSettingsContext = createContext<AppSettings>(DEFAULTS);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    getAppSettings()
      .then((data: Partial<AppSettings>) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        // Keep defaults silently — settings are non-critical
      });
  }, []);

  return (
    <AppSettingsContext.Provider value={settings}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
