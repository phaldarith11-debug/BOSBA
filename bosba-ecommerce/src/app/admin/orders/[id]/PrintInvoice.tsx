"use client";
import { Printer } from "lucide-react";

export function PrintInvoice() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors print:hidden"
    >
      <Printer className="h-4 w-4" />
      Print / Invoice
    </button>
  );
}
