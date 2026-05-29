"use client";
import { signOut, useSession } from "next-auth/react";
import { Bell, ChevronDown, LogOut, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  pendingOrders?: number;
}

export function AdminTopBar({ pendingOrders = 0 }: Props) {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const name = session?.user?.name ?? "Admin";
  const email = session?.user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Left: spacer on desktop, empty space on mobile (hamburger is fixed positioned) */}
      <div className="hidden md:block">
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      {/* Mobile: push content away from hamburger */}
      <div className="md:hidden w-10" />

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <Link
          href="/admin/orders?status=PENDING"
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Pending orders"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          {pendingOrders > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
              {pendingOrders > 99 ? "99+" : pendingOrders}
            </span>
          )}
        </Link>

        {/* View Store */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Store
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
                <Link
                  href="/admin/staff"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Account Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
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
