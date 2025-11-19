"use client";

import { useEffect, useRef, useMemo } from "react";
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

interface DataSeries {
  label: string;
  data: number[];
  color: string;
}

interface MultiLineChartProps {
  labels: string[];
  series: DataSeries[];
  title?: string;
}

export default function MultiLineChart({ labels, series, title }: MultiLineChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Memoize data to prevent unnecessary re-renders
  const data = useMemo(() => ({
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color,
      backgroundColor: `${s.color}20`,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: s.color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    })),
  }), [labels, series]);

  // Memoize options to prevent unnecessary re-renders
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString();
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value.toLocaleString();
          }
        },
      },
    },
  }), [title]);

  return (
    <div className="h-80">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
