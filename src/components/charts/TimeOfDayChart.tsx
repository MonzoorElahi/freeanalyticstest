"use client";

import { Bar } from "react-chartjs-2";
import type { MailChimpTimeOfDayStats } from "@/types";

interface TimeOfDayChartProps {
  data: MailChimpTimeOfDayStats[];
}

export default function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No time of day data available
      </div>
    );
  }

  // Sort by hour
  const sortedData = [...data].sort((a, b) => a.hour - b.hour);

  // Format hour to 12-hour format
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const chartData = {
    labels: sortedData.map((d) => formatHour(d.hour)),
    datasets: [
      {
        label: "Open Rate (%)",
        data: sortedData.map((d) => d.avgOpenRate * 100),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Click Rate (%)",
        data: sortedData.map((d) => d.avgClickRate * 100),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: "y",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
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
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const stats = sortedData[index];
            return [
              `Campaigns Sent: ${stats.campaignsSent}`,
              `Total Opens: ${stats.opens.toLocaleString()}`,
              `Total Clicks: ${stats.clicks.toLocaleString()}`,
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
          font: {
            size: 10,
          },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Rate (%)",
        },
        ticks: {
          callback: (value: any) => `${value.toFixed(1)}%`,
        },
      },
    },
  };

  // Find best time
  const bestTime = sortedData.reduce((max, curr) =>
    curr.avgOpenRate > max.avgOpenRate ? curr : max
  );

  return (
    <div className="space-y-4">
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>

      {/* Best Time Recommendation */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
          📊 Optimal Send Time
        </p>
        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
          {formatHour(bestTime.hour)} ({(bestTime.avgOpenRate * 100).toFixed(1)}% open rate)
        </p>
        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
          Based on {bestTime.campaignsSent} campaigns sent at this hour
        </p>
      </div>
    </div>
  );
}
