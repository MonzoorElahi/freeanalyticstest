"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProductSalesChartProps {
  data: { name: string; sales: number; quantity: number }[];
  metric?: "sales" | "quantity";
}

export default function ProductSalesChart({
  data,
  metric = "sales",
}: ProductSalesChartProps) {
  const labels = data.map((d) =>
    d.name.length > 25 ? d.name.substring(0, 25) + "..." : d.name
  );
  const values = data.map((d) => (metric === "sales" ? d.sales : d.quantity));

  const chartData = {
    labels,
    datasets: [
      {
        label: metric === "sales" ? "Revenue ($)" : "Units Sold",
        data: values,
        backgroundColor: [
          "rgba(147, 51, 234, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(34, 197, 94, 0.8)",
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: function (context: { parsed: { x: number | null } }) {
            const value = context.parsed.x || 0;
            if (metric === "sales") {
              return `Revenue: $${value.toLocaleString()}`;
            }
            return `Units: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value: string | number) {
            if (metric === "sales") {
              return "$" + Number(value).toLocaleString();
            }
            return value;
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
}
