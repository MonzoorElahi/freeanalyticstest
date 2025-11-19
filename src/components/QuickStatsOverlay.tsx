"use client";

import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";
import AnimatedCounter from "./AnimatedCounter";

interface QuickStat {
  label: string;
  value: number;
  change?: number;
  format?: "currency" | "number" | "percentage";
  currency?: string;
  icon?: any;
}

interface QuickStatsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stats: QuickStat[];
  title?: string;
}

export default function QuickStatsOverlay({
  isOpen,
  onClose,
  stats,
  title = "Quick Stats",
}: QuickStatsOverlayProps) {
  if (!isOpen) return null;

  const getFormattedValue = (value: number, format?: string, currency?: string) => {
    switch (format) {
      case "currency":
        return { prefix: currency === "EUR" ? "€" : "$", suffix: "", decimals: 2 };
      case "percentage":
        return { prefix: "", suffix: "%", decimals: 1 };
      default:
        return { prefix: "", suffix: "", decimals: 0 };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 animate-fadeIn backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-purple-500/50 w-full max-w-4xl p-8 pointer-events-auto animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const { prefix, suffix, decimals } = getFormattedValue(stat.value, stat.format, stat.currency);
              const hasChange = stat.change !== undefined;
              const isPositive = hasChange && stat.change! >= 0;
              const isNeutral = hasChange && stat.change === 0;

              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all group"
                >
                  {/* Icon (if provided) */}
                  {stat.icon && (
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <stat.icon className="w-16 h-16" />
                    </div>
                  )}

                  <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <AnimatedCounter
                        value={stat.value}
                        prefix={prefix}
                        suffix={suffix}
                        decimals={decimals}
                        className="text-4xl font-bold text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Change Indicator */}
                    {hasChange && (
                      <div className="mt-3 flex items-center gap-1">
                        {isNeutral ? (
                          <Minus className="w-4 h-4 text-gray-500" />
                        ) : isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            isNeutral
                              ? "text-gray-600 dark:text-gray-400"
                              : isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isPositive && "+"}
                          {stat.change!.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          vs last period
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">ESC</kbd> or click outside to close
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
