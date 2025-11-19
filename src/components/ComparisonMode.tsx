"use client";

import { ArrowRight, Calendar, X } from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  format?: "currency" | "number" | "percentage";
  currency?: string;
}

interface ComparisonModeProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriod: string;
  previousPeriod: string;
  data: ComparisonData[];
  title?: string;
}

export default function ComparisonMode({
  isOpen,
  onClose,
  currentPeriod,
  previousPeriod,
  data,
  title = "Period Comparison",
}: ComparisonModeProps) {
  if (!isOpen) return null;

  const formatValue = (value: number, format?: string, currency?: string) => {
    switch (format) {
      case "currency":
        return formatCurrency(value, currency || "EUR");
      case "percentage":
        return formatPercentage(value);
      case "number":
      default:
        return formatNumber(value);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="gradient-primary p-6 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">
                        {currentPeriod}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-white/75">{previousPeriod}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn-icon bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50/50 dark:bg-gray-900/20">
              <div className="space-y-4">
                {data.map((item, index) => {
                  const change = calculateChange(item.current, item.previous);
                  const isPositive = change >= 0;

                  return (
                    <div
                      key={index}
                      className="interactive-card bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                        {item.label}
                      </p>

                      <div className="grid grid-cols-3 gap-6">
                        {/* Current Period */}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Current</p>
                          <p className="text-2xl font-bold text-gradient">
                            {formatValue(item.current, item.format, item.currency)}
                          </p>
                        </div>

                        {/* Previous Period */}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Previous</p>
                          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            {formatValue(item.previous, item.format, item.currency)}
                          </p>
                        </div>

                        {/* Change */}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Change</p>
                          <div className="flex items-baseline gap-2">
                            <p
                              className={`text-2xl font-bold ${
                                isPositive
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {change.toFixed(1)}%
                            </p>
                          </div>
                          <p className={`text-xs mt-1 font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {isPositive ? "+" : ""}
                            {formatValue(item.current - item.previous, item.format, item.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Visual Bar with gradient */}
                      <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full smooth-slow shadow-lg ${
                            isPositive
                              ? "gradient-success"
                              : "gradient-warning"
                          }`}
                          style={{
                            width: `${Math.min(Math.abs(change), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
