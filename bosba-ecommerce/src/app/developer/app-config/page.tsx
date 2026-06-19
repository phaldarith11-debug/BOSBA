import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function DeveloperAppConfigPage() {
  return (
    <ComingSoon
      title="App Config"
      description="App-wide runtime configuration delivered to the website and mobile app."
      features={[
        "Single config consumed by both surfaces",
        "Versioned and cache-aware delivery",
        "Builds on the existing /api/app-settings pipe",
      ]}
      milestone="Milestone 3"
    />
  );
}
