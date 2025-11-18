/**
 * Profit/Loss Chart
 * Shows revenue, COGS, expenses, gross profit, and net profit over time
 */

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
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { ProfitByDate } from "@/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ProfitLossChartProps {
  data: ProfitByDate[];
  currency?: string;
  showNetProfit?: boolean;
}

export default function ProfitLossChart({
  data,
  currency = "USD",
  showNetProfit = true,
}: ProfitLossChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No profit/loss data available for this period
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const chartData = {
    labels: sortedData.map((d) => {
      try {
        return format(parseISO(d.date), "MMM d");
      } catch {
        return d.date;
      }
    }),
    datasets: [
      {
        label: "Revenue",
        data: sortedData.map((d) => d.revenue),
        borderColor: "rgba(34, 197, 94, 0.8)", // Green
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "COGS",
        data: sortedData.map((d) => d.cogs),
        borderColor: "rgba(239, 68, 68, 0.8)", // Red
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Expenses",
        data: sortedData.map((d) => d.expenses),
        borderColor: "rgba(249, 115, 22, 0.8)", // Orange
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Gross Profit",
        data: sortedData.map((d) => d.grossProfit),
        borderColor: "rgba(59, 130, 246, 0.8)", // Blue
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      ...(showNetProfit
        ? [
            {
              label: "Net Profit",
              data: sortedData.map((d) => d.netProfit),
              borderColor: "rgba(147, 51, 234, 0.8)", // Purple
              backgroundColor: "rgba(147, 51, 234, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ]
        : []),
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
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value, currency);
          },
        },
      },
    },
  };

  return (
    <div className="h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
