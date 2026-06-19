import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function DeveloperThemesPage() {
  return (
    <ComingSoon
      title="Themes"
      description="Control brand colors, fonts, radius, and logo for web + mobile from one place."
      features={[
        "Theme tokens consumed by the website (CSS vars) and mobile app",
        "Light/dark and per-brand presets",
        "Replaces hardcoded colors in the mobile app",
      ]}
      milestone="Milestone 3"
    />
  );
}
