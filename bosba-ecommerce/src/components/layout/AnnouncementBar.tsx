"use client";
import { useState } from "react";
import { X, Tag } from "lucide-react";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative bg-gray-950 text-white py-2.5 px-4 flex items-center justify-center">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-slow flex-shrink-0" />
        <Tag className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
        <p className="text-center">
          Free delivery on orders over{" "}
          <strong className="text-white">$30</strong>
          {" · "}Use code{" "}
          <code className="bg-white/10 text-yellow-400 font-mono font-bold px-1.5 py-0.5 rounded text-xs">
            WELCOME10
          </code>{" "}
          for 10% off your first order!
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
