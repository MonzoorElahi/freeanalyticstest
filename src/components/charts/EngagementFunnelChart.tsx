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
import { Mail, CheckCircle, Eye, MousePointer, ShoppingCart } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface EngagementFunnelChartProps {
  data: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    purchased: number;
  };
}

export default function EngagementFunnelChart({ data }: EngagementFunnelChartProps) {
  const { sent, delivered, opened, clicked, purchased } = data;

  // Calculate conversion rates
  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
  const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
  const conversionRate = clicked > 0 ? (purchased / clicked) * 100 : 0;

  const stages = [
    { label: "Sent", value: sent, icon: Mail, color: "bg-blue-500", rate: 100 },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "bg-green-500", rate: deliveryRate },
    { label: "Opened", value: opened, icon: Eye, color: "bg-purple-500", rate: openRate },
    { label: "Clicked", value: clicked, icon: MousePointer, color: "bg-orange-500", rate: clickRate },
    { label: "Purchased", value: purchased, icon: ShoppingCart, color: "bg-pink-500", rate: conversionRate },
  ];

  const chartData = {
    labels: stages.map(s => s.label),
    datasets: [
      {
        label: "Email Engagement Funnel",
        data: stages.map(s => s.value),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            const value = context.parsed.y;
            const index = context.dataIndex;
            const rate = stages[index].rate;
            return [
              `Count: ${formatNumber(value)}`,
              `Conversion: ${formatPercentage(rate)}`,
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

  return (
    <div className="space-y-4">
      {/* Funnel Visualization */}
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.label} className="text-center">
              <div className={`${stage.color} rounded-lg p-3 mb-2`}>
                <Icon className="w-5 h-5 text-white mx-auto" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{stage.label}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(stage.value)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercentage(stage.rate)}</p>
            </div>
          );
        })}
      </div>

      {/* Drop-off Analysis */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Drop-off Analysis</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Sent → Delivered</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatPercentage(deliveryRate)} delivery rate
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Delivered → Opened</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatPercentage(openRate)} open rate
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Opened → Clicked</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatPercentage(clickRate)} click rate
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Clicked → Purchased</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatPercentage(conversionRate)} conversion rate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
