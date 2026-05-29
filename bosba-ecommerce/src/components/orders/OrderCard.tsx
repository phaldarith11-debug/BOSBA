import Link from "next/link";
import { Badge, orderStatusBadge, paymentStatusBadge } from "@/components/ui/Badge";
import { formatUsd } from "@/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/constants";

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalUsd: number | string;
    createdAt: string | Date;
    items: Array<{ nameEn: string; quantity: number; imageUrl?: string | null }>;
  };
  locale?: string;
  href?: string;
}

export function OrderCard({ order, locale = "en", href }: OrderCardProps) {
  const date = new Date(order.createdAt).toLocaleDateString(locale === "km" ? "km-KH" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  const card = (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={orderStatusBadge(order.status)}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
          <Badge variant={paymentStatusBadge(order.paymentStatus)}>{PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 overflow-hidden">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex-shrink-0">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.nameEn} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg">📦</div>
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
        <span className="text-sm font-bold text-red-600">{formatUsd(Number(order.totalUsd))}</span>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}
