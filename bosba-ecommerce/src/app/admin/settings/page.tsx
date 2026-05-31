import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function saveSettings(formData: FormData) {
  "use server";
  const entries = Array.from(formData.entries()) as [string, string][];
  for (const [key, value] of entries) {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/api/app-settings");
}

type SettingField = {
  key: string;
  label: string;
  description: string;
  type?: string;
  placeholder?: string;
};

type SettingSection = {
  title: string;
  fields: SettingField[];
};

const SECTIONS: SettingSection[] = [
  {
    title: "Brand Identity",
    fields: [
      { key: "brand_name",       label: "Brand Name",        description: "Shown on website header and mobile app.", placeholder: "BOSBA" },
      { key: "brand_logo",       label: "Logo URL",          description: "Full URL to your logo image (Cloudinary or external).", placeholder: "https://res.cloudinary.com/..." },
      { key: "primary_color",    label: "Primary Color",     description: "Main brand color used for buttons and accents.", placeholder: "#e51b1b", type: "color" },
      { key: "secondary_color",  label: "Secondary Color",   description: "Used for dark sections and text.", placeholder: "#0f172a", type: "color" },
    ],
  },
  {
    title: "Homepage Content",
    fields: [
      { key: "homepage_hero_title_en",    label: "Hero Title (English)",    description: "Main headline shown on the homepage hero.", placeholder: "Shop Smart, Save More" },
      { key: "homepage_hero_title_km",    label: "Hero Title (Khmer)",      description: "Khmer version of the hero headline." },
      { key: "homepage_hero_subtitle_en", label: "Hero Subtitle (English)", description: "Short tagline under the headline.", placeholder: "Cambodia's Online Store" },
      { key: "homepage_hero_subtitle_km", label: "Hero Subtitle (Khmer)",   description: "Khmer version of the tagline." },
      { key: "announcement_en",           label: "Announcement Banner (EN)", description: "Shown in the top bar on the website and mobile app." },
      { key: "announcement_km",           label: "Announcement Banner (KM)", description: "Khmer version of the announcement." },
    ],
  },
  {
    title: "Business Settings",
    fields: [
      { key: "site_name",             label: "Site Name",              description: "Displayed in browser tab and emails.", placeholder: "BOSBA" },
      { key: "site_email",            label: "Contact Email",          description: "Shown on contact page and receipt emails.", placeholder: "hello@bosba.com" },
      { key: "site_phone",            label: "Contact Phone",          description: "Shown in footer and mobile app.", placeholder: "+855 XX XXX XXXX" },
      { key: "usd_khr_rate",          label: "USD/KHR Exchange Rate",  description: "Rate used for KHR price display.", type: "number", placeholder: "4100" },
      { key: "free_delivery_over_usd",label: "Free Delivery Threshold (USD)", description: "Orders above this amount get free delivery.", type: "number", placeholder: "50" },
      { key: "maintenance_mode",      label: "Maintenance Mode",       description: "Set to 1 to show maintenance page to customers.", type: "number", placeholder: "0" },
    ],
  },
  {
    title: "Social & Contact Links",
    fields: [
      { key: "social_facebook",  label: "Facebook URL",   description: "Full Facebook page URL.", placeholder: "https://facebook.com/bosba" },
      { key: "social_instagram", label: "Instagram URL",  description: "Full Instagram profile URL.", placeholder: "https://instagram.com/bosba" },
      { key: "social_telegram",  label: "Telegram Link",  description: "Telegram contact link or channel URL.", placeholder: "https://t.me/bosba" },
      { key: "social_tiktok",    label: "TikTok URL",     description: "Full TikTok profile URL.", placeholder: "https://tiktok.com/@bosba" },
      { key: "social_youtube",   label: "YouTube URL",    description: "YouTube channel URL.", placeholder: "https://youtube.com/@bosba" },
    ],
  },
  {
    title: "Footer Content",
    fields: [
      { key: "footer_about_en",  label: "About Text (English)", description: "Short description shown in website footer." },
      { key: "footer_about_km",  label: "About Text (Khmer)",   description: "Khmer version of the footer description." },
      { key: "footer_address",   label: "Business Address",     description: "Physical address shown in footer.", placeholder: "Phnom Penh, Cambodia" },
    ],
  },
];

export default async function AdminSettingsPage() {
  const records = await prisma.settings.findMany();
  const map = Object.fromEntries(records.map((r) => [r.key, r.value]));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          These settings control both the website and mobile app. Changes apply immediately after saving.
        </p>
      </div>

      <form action={saveSettings} className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{section.title}</h2>
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
              {section.fields.map((field) => (
                <div key={field.key} className="p-5">
                  <label className="block text-sm font-medium text-gray-900 mb-1">{field.label}</label>
                  <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                  {field.type === "color" ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-10 rounded-lg border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: map[field.key] ?? field.placeholder ?? "#000000" }}
                      />
                      <input
                        name={field.key}
                        type="text"
                        defaultValue={map[field.key] ?? field.placeholder ?? ""}
                        placeholder={field.placeholder}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                      />
                    </div>
                  ) : (
                    <input
                      name={field.key}
                      type={field.type ?? "text"}
                      defaultValue={map[field.key] ?? ""}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            className="bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
          >
            Save All Settings
          </button>
          <p className="text-xs text-gray-400">Settings apply to both website and mobile app</p>
        </div>
      </form>
    </div>
  );
}
