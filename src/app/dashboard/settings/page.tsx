"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Shield, LogOut, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your dashboard configuration
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Store Connection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Store className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Store Connection
              </h3>
              {sessionInfo.storeUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connected to:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sessionInfo.storeUrl}
                    </span>
                  </p>
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Store
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No store connected
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Security & Privacy
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Your API credentials are stored in an encrypted session
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  All data is fetched directly from your WooCommerce store
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  No data is stored on external servers
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Session automatically expires after 7 days of inactivity
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            About This Dashboard
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              This WooCommerce Analytics Dashboard provides comprehensive
              insights into your store&apos;s performance including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Real-time sales and revenue tracking</li>
              <li>Customer acquisition and retention metrics</li>
              <li>Product performance analysis</li>
              <li>Order management and filtering</li>
              <li>Advertisement attribution tracking</li>
            </ul>
            <p className="mt-4">
              Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and
              Chart.js.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
