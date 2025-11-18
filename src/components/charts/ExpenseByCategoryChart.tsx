"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import type { ExpenseCategory } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseByCategoryChartProps {
  data: {
    category: ExpenseCategory;
    total: number;
    count: number;
    percentage: number;
  }[];
  currency?: string;
}

export default function ExpenseByCategoryChart({ data, currency = "EUR" }: ExpenseByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No expense data available
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    Marketing: "rgba(139, 92, 246, 0.8)",
    Advertising: "rgba(59, 130, 246, 0.8)",
    Shipping: "rgba(16, 185, 129, 0.8)",
    Software: "rgba(251, 146, 60, 0.8)",
    Operations: "rgba(239, 68, 68, 0.8)",
    Salaries: "rgba(236, 72, 153, 0.8)",
    Rent: "rgba(14, 165, 233, 0.8)",
    Utilities: "rgba(168, 85, 247, 0.8)",
    Other: "rgba(107, 114, 128, 0.8)",
  };

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        label: "Expenses",
        data: data.map((d) => d.total),
        backgroundColor: data.map((d) => categoryColors[d.category] || "rgba(107, 114, 128, 0.8)"),
        borderColor: data.map((d) => (categoryColors[d.category] || "rgba(107, 114, 128, 0.8)").replace("0.8", "1")),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const item = data[context.dataIndex];
            return [
              `Amount: ${formatCurrency(item.total, currency)}`,
              `Count: ${item.count} expenses`,
              `Percentage: ${formatPercentage(item.percentage)}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Top 3 categories */}
      <div className="grid grid-cols-3 gap-3">
        {data.slice(0, 3).map((item, idx) => (
          <div
            key={item.category}
            className={`rounded-lg p-3 border ${
              idx === 0
                ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700"
                : idx === 1
                ? "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700"
                : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
            }`}
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              #{idx + 1} {item.category}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.total, currency)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.count} expenses • {formatPercentage(item.percentage)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
