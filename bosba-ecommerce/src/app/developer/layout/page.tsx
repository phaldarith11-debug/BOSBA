import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function DeveloperLayoutPage() {
  return (
    <ComingSoon
      title="Layout"
      description="No-code, config-driven page builder for homepage sections, menus, and navigation."
      features={[
        "Arrange a library of section types (hero, banners, product grids…)",
        "One JSON layout rendered identically on web + mobile",
        "Visibility rules per surface and locale",
      ]}
      milestone="Milestone 4"
    />
  );
}
