"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Receipt,
  Mail,
  Settings,
  BarChart3,
  Download,
  RefreshCw,
  X,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "go-overview",
        label: "Go to Overview",
        description: "Navigate to dashboard overview",
        icon: BarChart3,
        action: () => router.push("/dashboard"),
        keywords: ["dashboard", "overview", "home", "main"],
      },
      {
        id: "go-sales",
        label: "Go to Sales",
        description: "View sales analytics",
        icon: TrendingUp,
        action: () => router.push("/dashboard/sales"),
        keywords: ["sales", "revenue", "analytics"],
      },
      {
        id: "go-orders",
        label: "Go to Orders",
        description: "View and manage orders",
        icon: ShoppingCart,
        action: () => router.push("/dashboard/orders"),
        keywords: ["orders", "purchases", "transactions"],
      },
      {
        id: "go-customers",
        label: "Go to Customers",
        description: "View customer analytics",
        icon: Users,
        action: () => router.push("/dashboard/customers"),
        keywords: ["customers", "users", "clients"],
      },
      {
        id: "go-products",
        label: "Go to Products",
        description: "View product performance",
        icon: Package,
        action: () => router.push("/dashboard/products"),
        keywords: ["products", "items", "inventory"],
      },
      {
        id: "go-expenses",
        label: "Go to Expenses",
        description: "Manage expenses and budgets",
        icon: Receipt,
        action: () => router.push("/dashboard/expenses"),
        keywords: ["expenses", "costs", "budget", "spending"],
      },
      {
        id: "go-mailchimp",
        label: "Go to Email Marketing",
        description: "View MailChimp analytics",
        icon: Mail,
        action: () => router.push("/dashboard/mailchimp"),
        keywords: ["email", "mailchimp", "marketing", "campaigns"],
      },
      {
        id: "go-settings",
        label: "Go to Settings",
        description: "Manage dashboard settings",
        icon: Settings,
        action: () => router.push("/dashboard/settings"),
        keywords: ["settings", "preferences", "config"],
      },
      {
        id: "refresh",
        label: "Refresh Data",
        description: "Reload current page data",
        icon: RefreshCw,
        action: () => window.location.reload(),
        keywords: ["refresh", "reload", "update"],
      },
      {
        id: "export",
        label: "Export Data",
        description: "Export current page data",
        icon: Download,
        action: () => {
          // Trigger export on current page
          const exportBtn = document.querySelector('[aria-label="Export"]') as HTMLButtonElement;
          if (exportBtn) exportBtn.click();
        },
        keywords: ["export", "download", "save", "csv"],
      },
    ],
    [router]
  );

  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    const query = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.keywords.some((k) => k.includes(query))
    );
  }, [search, commands]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 animate-slideUp">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No commands found for "{search}"
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-purple-50 dark:bg-purple-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {cmd.label}
                        </p>
                        {cmd.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {cmd.description}
                          </p>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
