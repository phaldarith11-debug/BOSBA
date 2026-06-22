"use client";
import { DashboardErrorView } from "@/components/dashboard/DashboardErrorView";

export default function DeveloperError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardErrorView area="developer" error={error} reset={reset} />;
}
