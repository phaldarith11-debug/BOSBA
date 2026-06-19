import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function SellerStockPage() {
  return (
    <ComingSoon
      title="Stock"
      description="Monitor inventory levels and update stock for your products."
      features={[
        "Low-stock alerts for your catalog",
        "Bulk stock adjustments",
        "Per-variant inventory",
      ]}
    />
  );
}
