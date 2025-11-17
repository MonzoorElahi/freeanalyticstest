"use client";

import { Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface GoalIndicatorProps {
  label: string;
  current: number;
  target: number;
  currency?: string;
  showPercentage?: boolean;
}

export default function GoalIndicator({
  label,
  current,
  target,
  currency,
  showPercentage = true,
}: GoalIndicatorProps) {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const isAchieved = percentage >= 100;
  const clampedPercentage = Math.min(percentage, 100);

  // Color based on progress
  let progressColor = "bg-red-500";
  let textColor = "text-red-600 dark:text-red-400";
  if (percentage >= 75) {
    progressColor = "bg-green-500";
    textColor = "text-green-600 dark:text-green-400";
  } else if (percentage >= 50) {
    progressColor = "bg-yellow-500";
    textColor = "text-yellow-600 dark:text-yellow-400";
  } else if (percentage >= 25) {
    progressColor = "bg-orange-500";
    textColor = "text-orange-600 dark:text-orange-400";
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAchieved ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Target className="w-5 h-5 text-purple-600" />
          )}
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{label}</h4>
        </div>
        {showPercentage && (
          <span className={`text-sm font-semibold ${textColor}`}>
            {formatPercentage(percentage, 0)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute top-0 left-0 h-full ${progressColor} transition-all duration-500 rounded-full`}
          style={{ width: `${clampedPercentage}%` }}
        />
        {percentage > 100 && (
          <div className="absolute top-0 right-0 h-full bg-purple-500 opacity-50 animate-pulse"
               style={{ width: `${Math.min((percentage - 100) / 100 * 20, 20)}%` }} />
        )}
      </div>

      {/* Values */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Current: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currency ? formatCurrency(current, currency) : current.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Target: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currency ? formatCurrency(target, currency) : target.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status Message */}
      {isAchieved && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Goal achieved! {percentage > 100 ? `Exceeded by ${formatPercentage(percentage - 100, 0)}` : ""}
        </div>
      )}
    </div>
  );
}
