"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Shield, LogOut, CheckCircle, Settings2, Sparkles, Info, Palette, Bell, Globe } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();
  const [sessionInfo, setSessionInfo] = useState<{
    isLoggedIn: boolean;
    storeUrl: string | null;
  }>({ isLoggedIn: false, storeUrl: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        // Handle new standardized API response format
        const sessionData = data.success ? data.data : data;
        setSessionInfo(sessionData);
      });
  }, []);

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      console.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition space-y-8">
      {/* Header with Gradient */}
      <div className="glass-strong p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-700">
        <div className="animate-slide-in-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 gradient-primary rounded-xl shadow-lg animate-float">
              <Settings2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-base font-medium">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Manage your dashboard configuration and preferences
          </p>
        </div>
      </div>

      <div className="divider-gradient" />

      <div className="space-y-6 max-w-4xl">
        {/* Preferences */}
        <div className="interactive-card glass-card p-6 border-2 border-indigo-200 dark:border-indigo-700/50 animate-slide-in-up">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Display Preferences
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {mounted ? (
                          theme === "auto" ? "System default (Auto)" :
                          theme === "dark" ? "Dark mode" : "Light mode"
                        ) : "Loading..."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTheme("light")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          theme === "light"
                            ? "gradient-primary text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          theme === "dark"
                            ? "gradient-primary text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme("auto")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          theme === "auto"
                            ? "gradient-primary text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Currency Display</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Detected from store settings</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                      Auto
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="interactive-card glass-card p-6 border-2 border-orange-200 dark:border-orange-700/50 animate-slide-in-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Error Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Show toast notifications for errors</p>
                  </div>
                  <input type="checkbox" checked readOnly className="w-5 h-5 accent-orange-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Success Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Show toast notifications for successful actions</p>
                  </div>
                  <input type="checkbox" checked readOnly className="w-5 h-5 accent-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Connection */}
        <div className="interactive-card glass-card p-6 border-2 border-purple-200 dark:border-purple-700/50 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl gradient-primary shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Store Connection
              </h3>
              {sessionInfo.storeUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300 font-semibold">
                      Connected
                    </span>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">
                      Connected Store:
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white break-all">
                      {sessionInfo.storeUrl}
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-700 font-medium hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Disconnecting..." : "Disconnect Store"}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No store connected. Please log in to connect your WooCommerce store.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="interactive-card glass-card p-6 border-2 border-green-200 dark:border-green-700/50 animate-slide-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Security & Privacy
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Your API credentials are stored in an encrypted session
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    All data is fetched directly from your WooCommerce store
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    No data is stored on external servers
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Session automatically expires after 7 days of inactivity
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="interactive-card glass-card p-6 border-2 border-blue-200 dark:border-blue-700/50 animate-slide-in-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                About This Dashboard
              </h3>
              <div className="space-y-4 text-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  This WooCommerce Analytics Dashboard provides comprehensive
                  insights into your store&apos;s performance including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Real-time sales tracking</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Customer analytics</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Product performance</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Order management</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Ad attribution tracking</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Expense management</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Chart.js
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
