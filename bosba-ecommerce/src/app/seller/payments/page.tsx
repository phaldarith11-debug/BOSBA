import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function SellerPaymentsPage() {
  return (
    <ComingSoon
      title="Payments"
      description="See your earnings, commission, and payout history."
      features={[
        "Earnings after platform commission",
        "Payout schedule and history",
        "Bank/ABA payout details",
      ]}
    />
  );
}
