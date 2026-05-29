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
}

const SETTING_FIELDS: Array<{ key: string; label: string; description: string; type?: string }> = [
  { key: "site_name",             label: "Site Name",              description: "Displayed in browser tab and emails." },
  { key: "site_email",            label: "Contact Email",          description: "Shown on contact page." },
  { key: "site_phone",            label: "Contact Phone",          description: "Shown on contact page and footer." },
  { key: "usd_khr_rate",          label: "USD/KHR Exchange Rate",  description: "Rate used for KHR price display.", type: "number" },
  { key: "free_delivery_over_usd",label: "Free Delivery Threshold (USD)", description: "Orders above this get free delivery.", type: "number" },
  { key: "announcement_en",       label: "Announcement (English)", description: "Shown in the top bar on the website." },
  { key: "announcement_km",       label: "Announcement (Khmer)",   description: "Shown in the top bar on the website." },
  { key: "maintenance_mode",      label: "Maintenance Mode",       description: "Set to 1 to show maintenance page.", type: "number" },
];

export default async function AdminSettingsPage() {
  const records = await prisma.settings.findMany();
  const map = Object.fromEntries(records.map((r) => [r.key, r.value]));

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      <form action={saveSettings} className="space-y-5">
        {SETTING_FIELDS.map((field) => (
          <div key={field.key} className="bg-white border border-gray-200 rounded-2xl p-5">
            <label className="block text-sm font-medium text-gray-900 mb-1">{field.label}</label>
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            <input
              name={field.key}
              type={field.type ?? "text"}
              defaultValue={map[field.key] ?? ""}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-red-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
