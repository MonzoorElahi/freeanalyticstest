"use client";

import { Doughnut } from "react-chartjs-2";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface BudgetTrackingChartProps {
  budget: number;
  spent: number;
  currency?: string;
}

export default function BudgetTrackingChart({ budget, spent, currency = "EUR" }: BudgetTrackingChartProps) {
  const remaining = Math.max(0, budget - spent);
  const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = spent > budget;
  const overspend = isOverBudget ? spent - budget : 0;

  // Determine status color
  let statusColor = "green";
  let statusText = "On Track";
  let statusIcon = TrendingUp;

  if (percentageUsed >= 100) {
    statusColor = "red";
    statusText = "Over Budget";
    statusIcon = TrendingDown;
  } else if (percentageUsed >= 80) {
    statusColor = "amber";
    statusText = "Approaching Limit";
    statusIcon = AlertTriangle;
  }

  const StatusIcon = statusIcon;

  const chartData = {
    labels: isOverBudget ? ["Spent", "Over Budget"] : ["Spent", "Remaining"],
    datasets: [
      {
        data: isOverBudget ? [budget, overspend] : [spent, remaining],
        backgroundColor: isOverBudget
          ? ["rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.9)"]
          : [
              percentageUsed >= 80 ? "rgba(251, 146, 60, 0.8)" : "rgba(16, 185, 129, 0.8)",
              "rgba(209, 213, 219, 0.5)",
            ],
        borderColor: isOverBudget
          ? ["rgba(239, 68, 68, 1)", "rgba(220, 38, 38, 1)"]
          : [
              percentageUsed >= 80 ? "rgba(251, 146, 60, 1)" : "rgba(16, 185, 129, 1)",
              "rgba(209, 213, 219, 1)",
            ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = budget > 0 ? ((value / budget) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatCurrency(value, currency)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart with Center Text */}
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget Used</p>
          <p className={`text-3xl font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>
            {Math.min(percentageUsed, 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-lg p-4 border bg-${statusColor}-50 dark:bg-${statusColor}-900/20 border-${statusColor}-200 dark:border-${statusColor}-800`}
      >
        <div className="flex items-center gap-3 mb-3">
          <StatusIcon className={`w-6 h-6 text-${statusColor}-600 dark:text-${statusColor}-400`} />
          <div>
            <p className={`text-sm font-medium text-${statusColor}-900 dark:text-${statusColor}-100`}>
              {statusText}
            </p>
            <p className={`text-xs text-${statusColor}-700 dark:text-${statusColor}-300`}>
              {isOverBudget
                ? `${formatCurrency(overspend, currency)} over budget`
                : `${formatCurrency(remaining, currency)} remaining`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Budget:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(budget, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Spent:</span>
            <span className={`font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>
              {formatCurrency(spent, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600 dark:text-gray-400">
              {isOverBudget ? "Overspend:" : "Remaining:"}
            </span>
            <span className={`font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>
              {formatCurrency(isOverBudget ? overspend : remaining, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning if approaching limit */}
      {percentageUsed >= 80 && percentageUsed < 100 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ⚠️ You've used {percentageUsed.toFixed(0)}% of your budget. Consider reviewing upcoming expenses.
          </p>
        </div>
      )}
    </div>
  );
}
