"use client";

import { Check } from "lucide-react";

const CONFETTI = Array.from({ length: 14 }, (_, i) => i);
const COLORS = ["#e51b1b", "#f97316", "#fbbf24", "#22c55e", "#3b82f6"];

/**
 * Full-screen order-confirmation celebration: animated check + confetti.
 * Purely presentational — the caller decides how long to show it and what to do
 * next (e.g. route to the payment/tracking page).
 */
export function OrderSuccessOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-white/95 px-8 text-center backdrop-blur-sm">
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((i) => (
          <span
            key={i}
            className="animate-confetti absolute top-0 h-2.5 w-2.5 rounded-[2px]"
            style={{
              left: `${(i * 7 + 6) % 100}%`,
              backgroundColor: COLORS[i % COLORS.length],
              animationDuration: `${1.6 + (i % 5) * 0.25}s`,
              animationDelay: `${(i % 4) * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* check */}
      <div className="relative mb-7">
        <span className="absolute inset-0 animate-success-ring rounded-full border-4 border-green-400" />
        <div className="animate-success-pop flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-lg">
          <Check className="h-12 w-12 text-white" strokeWidth={3} />
        </div>
      </div>

      <h2 className="text-2xl font-black text-gray-900">Order placed!</h2>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        {message ?? "Thank you. Taking you to payment…"}
      </p>
    </div>
  );
}
