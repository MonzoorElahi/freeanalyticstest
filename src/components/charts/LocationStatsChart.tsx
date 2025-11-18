"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { MapPin } from "lucide-react";
import type { MailChimpLocationStats } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface LocationStatsChartProps {
  data: MailChimpLocationStats[];
  currency?: string;
}

export default function LocationStatsChart({ data, currency = "EUR" }: LocationStatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No location data available
      </div>
    );
  }

  // Take top 10 countries
  const topCountries = data.slice(0, 10);

  const chartData = {
    labels: topCountries.map((d) => d.country),
    datasets: [
      {
        label: "Opens",
        data: topCountries.map((d) => d.opens),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
      {
        label: "Clicks",
        data: topCountries.map((d) => d.clicks),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
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
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const location = topCountries[context.dataIndex];
            const lines = [
              `${context.dataset.label}: ${formatNumber(context.parsed.x)}`,
            ];
            if (location.orders > 0) {
              lines.push(`Orders: ${formatNumber(location.orders)}`);
            }
            if (location.revenue > 0) {
              lines.push(`Revenue: ${formatCurrency(location.revenue, currency)}`);
            }
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
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
          callback: (value: any) => formatNumber(value),
        },
      },
      y: {
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
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>

      {/* Top 3 countries cards */}
      <div className="grid grid-cols-3 gap-3">
        {topCountries.slice(0, 3).map((location, idx) => (
          <div
            key={location.country}
            className={`rounded-lg p-3 border ${
              idx === 0
                ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700"
                : idx === 1
                ? "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700"
                : "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                #{idx + 1} {location.country}
              </p>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(location.opens)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(location.clicks)} clicks
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
