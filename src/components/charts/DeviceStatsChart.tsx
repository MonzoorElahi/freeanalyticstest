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
import { formatNumber, formatPercentage } from "@/lib/formatters";
import { Smartphone, Monitor, Tablet, HelpCircle } from "lucide-react";
import type { MailChimpDeviceStats } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DeviceStatsChartProps {
  data: MailChimpDeviceStats[];
}

export default function DeviceStatsChart({ data }: DeviceStatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No device data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.device),
    datasets: [
      {
        label: "Opens",
        data: data.map((d) => d.opens),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
      },
      {
        label: "Clicks",
        data: data.map((d) => d.clicks),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
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
            const device = data[context.dataIndex];
            return [
              `${context.dataset.label}: ${formatNumber(context.parsed.y)}`,
              `Percentage: ${formatPercentage(device.percentage)}`,
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
    },
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Mobile":
        return Smartphone;
      case "Desktop":
        return Monitor;
      case "Tablet":
        return Tablet;
      default:
        return HelpCircle;
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {/* Device breakdown cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((device) => {
          const Icon = getDeviceIcon(device.device);
          return (
            <div
              key={device.device}
              className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {device.device}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPercentage(device.percentage)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(device.opens)} opens
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
