import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
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
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${changeColor}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
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

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {valuePrefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {valueSuffix}
      </p>

      {change !== undefined && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {changeLabel}
        </p>
      )}
    </div>
  );
}
