"use client";

import { useState } from "react";
import { Info, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";

interface InsightBadgeProps {
  type: "positive" | "negative" | "warning" | "info";
  message: string;
  detail?: string;
}

export default function InsightBadge({ type, message, detail }: InsightBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const configs = {
    positive: {
      icon: TrendingUp,
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    negative: {
      icon: TrendingDown,
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    info: {
      icon: Sparkles,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-help transition-all hover:shadow-md ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{message}</span>
        {detail && <Info className="w-3 h-3 opacity-60" />}
      </div>

      {/* Tooltip */}
      {showTooltip && detail && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 animate-fadeIn">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-lg">
            {detail}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
