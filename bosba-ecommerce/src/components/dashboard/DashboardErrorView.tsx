"use client";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Friendly fallback for dashboard route errors. Keeps the user in control
 * (retry / go to login) instead of the bare "Application error" screen, and
 * surfaces the error digest so it can be matched to the Vercel logs.
 */
export function DashboardErrorView({
  area,
  error,
  reset,
}: {
  area: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const loginPath = `/${area}/login`;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-5">
        <AlertTriangle className="h-7 w-7 text-amber-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        This dashboard couldn&apos;t load. This is usually a temporary issue or a
        configuration problem on the server. Your data is safe.
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs text-gray-400">
          Reference: <span className="font-mono">{error.digest}</span>
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
        >
          <RotateCw className="h-4 w-4" /> Try again
        </button>
        <a
          href={loginPath}
          className="inline-flex items-center text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Sign in again
        </a>
      </div>
    </div>
  );
}
