"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import { getCurrencySymbol } from "@/lib/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  data: { date: string; total: number; orders: number }[];
  type?: "line" | "bar";
  showOrders?: boolean;
  currency?: string;
}

export default function SalesChart({
  data,
  type = "line",
  showOrders = false,
  currency = "USD",
}: SalesChartProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const labels = data.map((d) => format(parseISO(d.date), "MMM dd"));
  const salesData = data.map((d) => d.total);
  const ordersData = data.map((d) => d.orders);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: salesData,
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      ...(showOrders
        ? [
            {
              label: "Orders",
              data: ordersData,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: false,
              tension: 0.4,
              yAxisID: "y1",
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
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: function (context: { dataset: { label?: string }; parsed: { y: number | null } }) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (label === "Revenue") {
              return `${label}: ${currencySymbol}${value?.toLocaleString()}`;
            }
            return `${label}: ${value}`;
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
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value: string | number) {
            return currencySymbol + Number(value).toLocaleString();
          },
        },
      },
      ...(showOrders
        ? {
            y1: {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              grid: {
                drawOnChartArea: false,
              },
            },
          }
        : {}),
    },
  };

  return (
    <div className="h-80">
      {type === "line" ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
