type Variant = "gray" | "red" | "green" | "yellow" | "blue" | "purple";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<Variant, string> = {
  gray:   "bg-gray-100 text-gray-700",
  red:    "bg-red-100 text-red-700",
  green:  "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue:   "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({ variant = "gray", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function orderStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    PENDING: "yellow",
    CONFIRMED: "blue",
    PROCESSING: "purple",
    SHIPPED: "blue",
    DELIVERED: "green",
    CANCELLED: "red",
    REFUNDED: "gray",
  };
  return map[status] ?? "gray";
}

export function paymentStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    PENDING: "yellow",
    PAID: "green",
    FAILED: "red",
    REFUNDED: "gray",
  };
  return map[status] ?? "gray";
}
