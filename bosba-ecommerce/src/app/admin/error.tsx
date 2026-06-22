"use client";
import { DashboardErrorView } from "@/components/dashboard/DashboardErrorView";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardErrorView area="admin" error={error} reset={reset} />;
}
