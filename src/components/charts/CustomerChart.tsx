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
import { format, parseISO } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CustomerChartProps {
  data: { date: string; count: number }[];
}

export default function CustomerChart({ data }: CustomerChartProps) {
  const labels = data.map((d) => format(parseISO(d.date), "MMM dd"));
  const counts = data.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "New Customers",
        data: counts,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
