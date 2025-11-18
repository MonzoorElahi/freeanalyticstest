"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useToast } from "../Toast";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  title?: string;
  onSegmentClick?: (label: string, value: number, index: number) => void;
}

export default function DoughnutChart({
  labels,
  data,
  title,
  onSegmentClick,
}: DoughnutChartProps) {
  const { showToast } = useToast();
  const chartData = {
    labels,
    datasets: [
      {
        label: title || "Distribution",
        data,
        backgroundColor: [
          "rgba(147, 51, 234, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(14, 165, 233, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
      },
    },
    cutout: "60%",
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const label = labels[index];
        const value = data[index];

        if (onSegmentClick) {
          onSegmentClick(label, value, index);
        } else {
          // Default behavior: show toast notification
          showToast({
            type: "info",
            title: "Filter by " + label,
            message: `Click handler not configured. Value: ${value}`,
            duration: 3000,
          });
        }
      }
    },
    onHover: (event: any, elements: any[]) => {
      if (event.native && event.native.target) {
        event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
      }
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
