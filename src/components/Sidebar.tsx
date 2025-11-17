"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  LogOut,
  Store,
  Settings,
} from "lucide-react";

interface SidebarProps {
  storeUrl?: string | null;
}

export default function Sidebar({ storeUrl }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/sales", icon: TrendingUp, label: "Sales" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    { href: "/dashboard/products", icon: Package, label: "Products" },
  ];

  const storeName = storeUrl
    ? new URL(storeUrl).hostname.replace("www.", "")
    : "Store";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src="https://ci3.googleusercontent.com/meips/ADKq_NaE_oWXdD1JtInFmEcyVBj_2iUGqAxLkH0Puq4Ekzxkyax7RMFeP15ETdyAMHq5uOOPBgLceV0_auWlExOTyX-lgGdqQeIVkItlVKEtBkvGtzmTPczB_vJ5ZmQyow=s0-d-e1-ft#https://media.marka-img.com/2496c9ee/xtzZUEqs8oyai7SQP486DHaNA4VbUp.png"
            alt="Logo"
            className="w-10 h-10 rounded-lg object-contain"
          />
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              WooAnalytics
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
              {storeName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
