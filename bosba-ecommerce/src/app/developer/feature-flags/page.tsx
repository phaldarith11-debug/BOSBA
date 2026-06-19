import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function DeveloperFeatureFlagsPage() {
  return (
    <ComingSoon
      title="Feature Flags"
      description="Turn features on or off across the website and mobile app without deploying."
      features={[
        "Per-feature toggles evaluated on web + mobile",
        "Gradual rollout and targeting",
        "Exposed via the shared app-config API",
      ]}
      milestone="Milestone 5"
    />
  );
}
