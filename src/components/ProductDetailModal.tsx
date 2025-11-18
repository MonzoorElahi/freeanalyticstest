"use client";

import { X, TrendingUp, Package, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import ProductSalesTrendChart from "./charts/ProductSalesTrendChart";
import { useEffect } from "react";

interface DailySales {
  date: string;
  total: number;
  quantity: number;
}

interface ProductStats {
  totalRevenue: number;
  totalQuantity: number;
  avgDailySales: number;
  peakDay: { date: string; total: number };
  trend: "increasing" | "decreasing" | "stable";
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    sku?: string;
    price: string;
    stock_quantity: number | null;
    total_sales: number;
  };
  dailySales: DailySales[];
  currency?: string;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  dailySales,
  currency = "USD",
}: ProductDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate stats
  const stats: ProductStats = {
    totalRevenue: dailySales.reduce((sum, day) => sum + day.total, 0),
    totalQuantity: dailySales.reduce((sum, day) => sum + day.quantity, 0),
    avgDailySales: dailySales.length > 0
      ? dailySales.reduce((sum, day) => sum + day.total, 0) / dailySales.length
      : 0,
    peakDay: dailySales.length > 0
      ? dailySales.reduce((max, day) => (day.total > max.total ? day : max), dailySales[0])
      : { date: "", total: 0 },
    trend: "stable" as const,
  };

  // Calculate trend
  if (dailySales.length >= 2) {
    const firstHalf = dailySales.slice(0, Math.floor(dailySales.length / 2));
    const secondHalf = dailySales.slice(Math.floor(dailySales.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.total, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.total, 0) / secondHalf.length;

    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (Math.abs(change) < 5) {
      stats.trend = "stable";
    } else if (change > 0) {
      stats.trend = "increasing";
    } else {
      stats.trend = "decreasing";
    }
  }

  const trendColors = {
    increasing: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    decreasing: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    stable: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {product.sku && (
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      SKU: {product.sku}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Price: {formatCurrency(parseFloat(product.price), currency)}
                  </span>
                  {product.stock_quantity !== null && (
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      Stock: {product.stock_quantity}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalRevenue, currency)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Units Sold
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats.totalQuantity)}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg Daily Sales
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.avgDailySales, currency)}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border ${trendColors[stats.trend]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Sales Trend
                    </span>
                  </div>
                  <p className="text-2xl font-bold capitalize">
                    {stats.trend}
                  </p>
                </div>
              </div>

              {/* Peak Day Info */}
              {stats.peakDay.date && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-400 mb-1">
                        🏆 Best Selling Day
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date(stats.peakDay.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.peakDay.total, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <ProductSalesTrendChart
                  productName={product.name}
                  dailySales={dailySales}
                  currency={currency}
                  compact={false}
                />
              </div>

              {/* Daily Sales Table */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Daily Sales Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Units Sold
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[...dailySales].reverse().map((day, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                            {formatNumber(day.quantity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-bold">
                            {formatCurrency(day.total, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
