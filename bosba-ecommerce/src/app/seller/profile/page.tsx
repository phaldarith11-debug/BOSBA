import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function SellerProfilePage() {
  return (
    <ComingSoon
      title="Business Profile"
      description="Manage your store name, logo, description, and contact details."
      features={[
        "Store branding shown to customers",
        "Contact and support info",
        "Verification and approval status",
      ]}
    />
  );
}
