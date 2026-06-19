"use client";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  /** Where to send the user after signing out (the area's login page). */
  signOutCallbackUrl: string;
  /** Optional "Account" link in the user menu. */
  accountHref?: string;
  /** Fallback display name when the session has none. */
  fallbackName?: string;
}

export function DashboardTopBar({ signOutCallbackUrl, accountHref, fallbackName = "User" }: Props) {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const name = session?.user?.name ?? fallbackName;
  const email = session?.user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="hidden md:block">
        <p className="text-xs text-gray-400" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="md:hidden w-10" />

      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Store
        </Link>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initial}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{name}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 py-1.5 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">{email}</p>
                </div>
                {accountHref && (
                  <Link
                    href={accountHref}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: signOutCallbackUrl })}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
