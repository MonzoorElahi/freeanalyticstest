"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { formatNumber, formatPercentage } from "@/lib/formatters";
import type { MailChimpEmailClient } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmailClientChartProps {
  data: MailChimpEmailClient[];
}

export default function EmailClientChart({ data }: EmailClientChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No email client data available
      </div>
    );
  }

  const colors = [
    "rgba(139, 92, 246, 0.8)", // Purple
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(16, 185, 129, 0.8)", // Green
    "rgba(251, 146, 60, 0.8)", // Orange
    "rgba(239, 68, 68, 0.8)", // Red
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(14, 165, 233, 0.8)", // Cyan
    "rgba(168, 85, 247, 0.8)", // Violet
    "rgba(34, 197, 94, 0.8)", // Lime
    "rgba(249, 115, 22, 0.8)", // Amber
  ];

  const chartData = {
    labels: data.map((d) => d.client),
    datasets: [
      {
        label: "Opens",
        data: data.map((d) => d.opens),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map((c) => c.replace("0.8", "1")),
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
            const client = data[context.dataIndex];
            return [
              `Opens: ${formatNumber(client.opens)}`,
              `Clicks: ${formatNumber(client.clicks)}`,
              `Share: ${formatPercentage(client.percentage)}`,
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

      {/* Top 3 clients */}
      <div className="grid grid-cols-3 gap-3">
        {data.slice(0, 3).map((client, idx) => (
          <div
            key={client.client}
            className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700"
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              #{idx + 1} {client.client}
            </p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatPercentage(client.percentage)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(client.opens)} opens
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
