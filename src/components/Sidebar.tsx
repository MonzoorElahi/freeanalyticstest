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
  Mail,
  Receipt,
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
    { href: "/dashboard/expenses", icon: Receipt, label: "Expenses" },
    { href: "/dashboard/mailchimp", icon: Mail, label: "Email Marketing" },
  ];

  const storeName = storeUrl
    ? new URL(storeUrl).hostname.replace("www.", "")
    : "Store";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-purple-100 dark:border-purple-900/30 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-purple-100 dark:border-purple-900/30">
        <div className="flex items-center gap-3 animate-slide-in-left">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl shadow-sm animate-float">
            <img
              src="https://ci3.googleusercontent.com/meips/ADKq_NaE_oWXdD1JtInFmEcyVBj_2iUGqAxLkH0Puq4Ekzxkyax7RMFeP15ETdyAMHq5uOOPBgLceV0_auWlExOTyX-lgGdqQeIVkItlVKEtBkvGtzmTPczB_vJ5ZmQyow=s0-d-e1-ft#https://media.marka-img.com/2496c9ee/xtzZUEqs8oyai7SQP486DHaNA4VbUp.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-lg">
              WooAnalytics
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px] font-medium">
              {storeName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl smooth-fast font-semibold animate-fadeIn ${
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 active:scale-95"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'animate-float' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800 to-transparent" />

      {/* Footer */}
      <div className="p-4 space-y-1.5">
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="btn-ghost w-full flex items-center gap-3 justify-start"
        >
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 smooth-fast active:scale-95 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
