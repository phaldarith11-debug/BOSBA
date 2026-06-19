import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function SellerOrdersPage() {
  return (
    <ComingSoon
      title="My Orders"
      description="View and fulfil the orders that contain your products."
      features={[
        "See only the order items belonging to your store",
        "Update fulfilment status for your items",
        "Per-seller totals split out of multi-vendor orders",
      ]}
    />
  );
}
