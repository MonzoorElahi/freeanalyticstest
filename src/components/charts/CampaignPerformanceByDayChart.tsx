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
import { formatPercentage, formatNumber } from "@/lib/formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CampaignPerformanceByDayChartProps {
  data: {
    day: string;
    count: number;
    avgOpenRate: number;
    avgClickRate: number;
  }[];
}

export default function CampaignPerformanceByDayChart({ data }: CampaignPerformanceByDayChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No campaign performance data available
      </div>
    );
  }

  // Sort by day of week
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedData = [...data].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

  const chartData = {
    labels: sortedData.map((d) => d.day.slice(0, 3)), // Mon, Tue, etc.
    datasets: [
      {
        label: "Open Rate",
        data: sortedData.map((d) => d.avgOpenRate * 100),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "Click Rate",
        data: sortedData.map((d) => d.avgClickRate * 100),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        yAxisID: "y",
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
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            const dayData = sortedData[context.dataIndex];
            return [
              `${label}: ${formatPercentage(value)}`,
              `Campaigns: ${formatNumber(dayData.count)}`,
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
            size: 12,
          },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        max: 50, // Max 50% for better scale
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  // Find best day
  const bestDay = [...sortedData].sort((a, b) => b.avgOpenRate - a.avgOpenRate)[0];

  return (
    <div className="space-y-4">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {/* Best performing day insight */}
      {bestDay && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🏆 <strong className="text-purple-600 dark:text-purple-400">{bestDay.day}</strong> is your best performing day with{" "}
            <strong>{formatPercentage(bestDay.avgOpenRate * 100)}</strong> average open rate and{" "}
            <strong>{formatPercentage(bestDay.avgClickRate * 100)}</strong> click rate across{" "}
            <strong>{formatNumber(bestDay.count)}</strong> campaigns.
          </p>
        </div>
      )}
    </div>
  );
}
