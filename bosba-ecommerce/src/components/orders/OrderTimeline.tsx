import { CheckCircle, Circle, Clock } from "lucide-react";

const STEPS = [
  { status: "PENDING",    label: "Order Placed" },
  { status: "CONFIRMED",  label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED",    label: "Shipped" },
  { status: "DELIVERED",  label: "Delivered" },
] as const;

const STEP_ORDER = STEPS.map((s) => s.status);

interface OrderTimelineProps {
  currentStatus: string;
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === "CANCELLED" || currentStatus === "REFUNDED") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
        <Circle className="h-4 w-4" />
        <span>Order {currentStatus.toLowerCase()}</span>
      </div>
    );
  }

  const currentIndex = STEP_ORDER.indexOf(currentStatus as typeof STEP_ORDER[number]);

  return (
    <ol className="relative ml-2 border-l border-gray-200 space-y-6 py-2">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.status} className="pl-6 relative">
            <span className={`absolute -left-[9px] flex items-center justify-center w-[18px] h-[18px] rounded-full ${done || active ? "bg-red-600" : "bg-gray-200"}`}>
              {done ? (
                <CheckCircle className="h-3 w-3 text-white" />
              ) : active ? (
                <Clock className="h-3 w-3 text-white" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-400 block" />
              )}
            </span>
            <p className={`text-sm font-medium ${active ? "text-red-600" : done ? "text-gray-900" : "text-gray-400"}`}>
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
