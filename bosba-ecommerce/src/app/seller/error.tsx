"use client";
import { DashboardErrorView } from "@/components/dashboard/DashboardErrorView";

export default function SellerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardErrorView area="seller" error={error} reset={reset} />;
}
