import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "km", "ja", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed", // English: /products  Others: /km/products, /ja/products, /zh/products
});
