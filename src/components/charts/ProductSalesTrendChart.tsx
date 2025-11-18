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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "@/lib/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailySales {
  date: string;
  total: number;
  quantity: number;
}

interface ProductSalesTrendChartProps {
  productName: string;
  dailySales: DailySales[];
  currency?: string;
  compact?: boolean;
}

export default function ProductSalesTrendChart({
  productName,
  dailySales,
  currency = "USD",
  compact = false,
}: ProductSalesTrendChartProps) {
  if (!dailySales || dailySales.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-500 dark:text-gray-400 ${compact ? "h-20" : "h-64"}`}>
        <p className="text-sm">No sales data available</p>
      </div>
    );
  }

  // Sort by date
  const sortedData = [...dailySales].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labels = sortedData.map((item) => {
    const date = new Date(item.date);
    return compact
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  });

  const salesData = sortedData.map((item) => item.total);
  const quantityData = sortedData.map((item) => item.quantity);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: salesData,
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: compact ? 0 : 4,
        pointHoverRadius: compact ? 3 : 6,
        borderWidth: compact ? 2 : 3,
        yAxisID: "y",
      },
      ...(compact ? [] : [
        {
          label: "Units Sold",
          data: quantityData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          yAxisID: "y1",
        },
      ]),
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
        display: !compact,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !compact,
        text: `${productName} - Sales Trend`,
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;

            if (label === "Revenue") {
              return `${label}: ${formatCurrency(value, currency)}`;
            }
            return `${label}: ${value} units`;
          },
        },
      },
    },
    scales: compact ? {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    } : {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Revenue",
        },
        ticks: {
          callback: function (value: any) {
            return formatCurrency(Number(value), currency);
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Units Sold",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className={compact ? "h-20" : "h-64"}>
      <Line data={chartData} options={options} />
    </div>
  );
}
