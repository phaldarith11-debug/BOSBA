import { Wrench } from "lucide-react";

/** Shown to shoppers when the Developer console turns on maintenance mode. */
export function MaintenanceScreen({ brandName, message }: { brandName: string; message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
        <Wrench className="h-8 w-8 text-amber-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{brandName} is under maintenance</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        {message?.trim() || "We're making some improvements and will be back shortly. Thank you for your patience."}
      </p>
    </div>
  );
}
