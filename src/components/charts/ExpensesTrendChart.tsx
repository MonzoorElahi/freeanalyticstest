"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { formatCurrency, formatNumber } from "@/lib/formatters";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ExpensesTrendChartProps {
  data: {
    month: string;
    total: number;
    count: number;
  }[];
  currency?: string;
}

export default function ExpensesTrendChart({ data, currency = "EUR" }: ExpensesTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No trend data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Total Expenses",
        data: data.map((d) => d.total),
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#6B7280",
          font: {
            size: 12,
            weight: 500,
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(239, 68, 68, 0.5)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const item = data[context.dataIndex];
            return [
              `Total: ${formatCurrency(context.parsed.y, currency)}`,
              `Count: ${formatNumber(item.count)} expenses`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          callback: (value: any) => formatCurrency(value, currency),
        },
      },
    },
  };

  // Calculate trend
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const trend = previousMonth
    ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      {/* Trend indicator */}
      {previousMonth && (
        <div className={`rounded-lg p-4 border ${
          trend > 0
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
            : trend < 0
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
            : "bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700"
        }`}>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {trend > 0 ? "📈" : trend < 0 ? "📉" : "➡️"} Expenses{" "}
            <strong className={trend > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
              {trend > 0 ? "increased" : "decreased"}
            </strong>{" "}
            by <strong>{Math.abs(trend).toFixed(1)}%</strong> compared to last month
            ({formatCurrency(currentMonth.total, currency)} vs {formatCurrency(previousMonth.total, currency)})
          </p>
        </div>
      )}
    </div>
  );
}
