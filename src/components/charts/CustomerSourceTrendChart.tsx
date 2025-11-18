/**
 * Customer Source Trend Chart
 * Shows new customers over time grouped by acquisition source
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface CustomerSourceTrendChartProps {
  data: {
    date: string;
    sources: { source: string; count: number }[];
  }[];
}

// Predefined colors for common sources
const sourceColors: Record<string, string> = {
  "Google Ads": "rgba(234, 67, 53, 0.8)", // Google red
  "Facebook Ads": "rgba(24, 119, 242, 0.8)", // Facebook blue
  "Instagram Ads": "rgba(225, 48, 108, 0.8)", // Instagram pink
  "Bing Ads": "rgba(0, 120, 215, 0.8)", // Bing blue
  "Paid Ads": "rgba(245, 158, 11, 0.8)", // Amber
  "Organic Search": "rgba(16, 185, 129, 0.8)", // Green
  "Social Media": "rgba(168, 85, 247, 0.8)", // Purple
  "Email Marketing": "rgba(59, 130, 246, 0.8)", // Blue
  "Referral": "rgba(236, 72, 153, 0.8)", // Pink
  "Direct": "rgba(107, 114, 128, 0.8)", // Gray
  "Direct / Organic": "rgba(156, 163, 175, 0.8)", // Light gray
  "UTM Campaign": "rgba(249, 115, 22, 0.8)", // Orange
};

const defaultColors = [
  "rgba(147, 51, 234, 0.8)",
  "rgba(59, 130, 246, 0.8)",
  "rgba(16, 185, 129, 0.8)",
  "rgba(245, 158, 11, 0.8)",
  "rgba(239, 68, 68, 0.8)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(99, 102, 241, 0.8)",
  "rgba(14, 165, 233, 0.8)",
];

export default function CustomerSourceTrendChart({ data }: CustomerSourceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No customer source data available for this period
      </div>
    );
  }

  // Get all unique sources
  const allSources = new Set<string>();
  data.forEach((day) => {
    day.sources.forEach((s) => allSources.add(s.source));
  });

  const sources = Array.from(allSources);

  // Build datasets for each source
  const datasets = sources.map((source, index) => {
    const color = sourceColors[source] || defaultColors[index % defaultColors.length];

    return {
      label: source,
      data: data.map((day) => {
        const sourceData = day.sources.find((s) => s.source === source);
        return sourceData?.count || 0;
      }),
      borderColor: color,
      backgroundColor: color.replace("0.8", "0.1"),
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  });

  const chartData = {
    labels: data.map((d) => {
      try {
        return format(parseISO(d.date), "MMM d");
      } catch {
        return d.date;
      }
    }),
    datasets,
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
            return `${label}: ${value} customers`;
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
          stepSize: 1,
          callback: function (value: any) {
            return Number.isInteger(value) ? value : null;
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
