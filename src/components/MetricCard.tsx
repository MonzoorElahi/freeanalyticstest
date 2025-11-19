"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  animated?: boolean;
  decimals?: number;
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs previous period",
  icon: Icon,
  iconColor = "text-purple-600 dark:text-purple-400",
  valuePrefix = "",
  valueSuffix = "",
  animated = true,
  decimals = 0,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="metric-card p-6 group animate-fadeIn card-elevated">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 smooth-hover group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${iconColor} smooth-hover group-hover:rotate-12`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${changeColor} animate-bounce-in`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 animate-float" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {animated && typeof value === "number" ? (
          <AnimatedCounter
            value={value}
            prefix={valuePrefix}
            suffix={valueSuffix}
            decimals={decimals}
          />
        ) : (
          <>
            {valuePrefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {valueSuffix}
          </>
        )}
      </p>

      {change !== undefined && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {changeLabel}
        </p>
      )}

      {/* Progress indicator line */}
      <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full smooth-slow ${
            isPositive
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          } group-hover:w-full transition-all`}
          style={{ width: change !== undefined ? `${Math.min(Math.abs(change), 100)}%` : "50%" }}
        />
      </div>
    </div>
  );
}
