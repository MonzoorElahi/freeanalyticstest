"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, parseISO, addDays } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ComparisonChartProps {
  currentData: { date: string; value: number }[];
  previousData: { date: string; value: number }[];
  currentLabel: string;
  previousLabel: string;
  valueFormatter?: (value: number) => string;
}

export default function ComparisonChart({
  currentData,
  previousData,
  currentLabel,
  previousLabel,
  valueFormatter = (v) => v.toString(),
}: ComparisonChartProps) {
  // Align data by day number (1, 2, 3...) instead of actual dates
  const maxLength = Math.max(currentData.length, previousData.length);
  const labels = Array.from({ length: maxLength }, (_, i) => `Day ${i + 1}`);

  // Also show actual dates as secondary labels
  const currentDates = currentData.map((d) => format(parseISO(d.date), "MMM dd"));
  const previousDates = previousData.map((d) => format(parseISO(d.date), "MMM dd"));

  const chartData = {
    labels,
    datasets: [
      {
        label: currentLabel,
        data: currentData.map((d) => d.value),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      {
        label: previousLabel,
        data: previousData.map((d) => d.value),
        borderColor: "rgb(156, 163, 175)",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [5, 5],
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
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          title: function (context: { dataIndex: number }[]) {
            const idx = context[0].dataIndex;
            const currentDate = currentDates[idx] || "";
            const prevDate = previousDates[idx] || "";
            return `${currentDate} vs ${prevDate}`;
          },
          label: function (context: { dataset: { label?: string }; parsed: { y: number | null } }) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${valueFormatter(value)}`;
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
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value: string | number) {
            return valueFormatter(Number(value));
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
