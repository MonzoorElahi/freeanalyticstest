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
import { formatCurrency } from "@/lib/formatters";
import { format, parseISO } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface MailChimpEbookChartProps {
  data: {
    date: string;
    downloads: number;
    revenue: number;
  }[];
  currency?: string;
}

export default function MailChimpEbookChart({ data, currency = "EUR" }: MailChimpEbookChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No ebook download data available from MailChimp campaigns
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const chartData = {
    labels: sortedData.map((d) => format(parseISO(d.date), "MMM d")),
    datasets: [
      {
        label: "Ebook Downloads",
        data: sortedData.map((d) => d.downloads),
        borderColor: "rgba(16, 185, 129, 0.8)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "Revenue from Ebooks",
        data: sortedData.map((d) => d.revenue),
        borderColor: "rgba(59, 130, 246, 0.8)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        yAxisID: "y1",
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
        borderColor: "rgba(16, 185, 129, 0.5)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (context.datasetIndex === 1) {
              return `${label}: ${formatCurrency(value, currency)}`;
            }
            return `${label}: ${value} downloads`;
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
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(16, 185, 129, 0.8)",
          font: {
            size: 11,
          },
          callback: (value: any) => `${value} downloads`,
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(59, 130, 246, 0.8)",
          font: {
            size: 11,
          },
          callback: (value: any) => formatCurrency(value, currency),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
