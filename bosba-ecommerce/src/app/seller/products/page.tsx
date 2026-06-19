import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function SellerProductsPage() {
  return (
    <ComingSoon
      title="My Products"
      description="Create, edit, and publish the products you sell on BOSBA."
      features={[
        "Add products owned by your store (your own catalog, scoped to you)",
        "Set pricing in USD/KHR, images, variants, and stock",
        "Submit products for marketplace approval",
      ]}
    />
  );
}
