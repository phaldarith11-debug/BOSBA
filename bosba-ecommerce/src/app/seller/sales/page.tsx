import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function SellerSalesPage() {
  return (
    <ComingSoon
      title="Sales"
      description="Track your revenue, best-sellers, and performance over time."
      features={[
        "Revenue and units sold scoped to your store",
        "Top products and trends",
        "Date-range filtering and export",
      ]}
    />
  );
}
