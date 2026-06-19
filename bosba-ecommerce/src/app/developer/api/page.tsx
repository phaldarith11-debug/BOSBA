import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function DeveloperApiPage() {
  return (
    <ComingSoon
      title="API Settings"
      description="Manage integration keys, webhooks, and third-party connections."
      features={[
        "Payment, Telegram, and Cloudinary integration config",
        "Webhook endpoints and secrets (stored server-side only)",
        "Never exposed through the public app-settings API",
      ]}
      milestone="Milestone 5"
    />
  );
}
