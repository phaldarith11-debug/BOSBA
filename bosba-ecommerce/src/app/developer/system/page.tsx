import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function DeveloperSystemPage() {
  return (
    <ComingSoon
      title="System Settings"
      description="Core platform configuration managed from the database."
      features={[
        "Typed, validated system configuration",
        "Separate developer-only vs admin-editable settings",
        "Environment and runtime info",
      ]}
      milestone="Milestone 3"
    />
  );
}
