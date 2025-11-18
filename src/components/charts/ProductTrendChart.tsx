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
import { format, parseISO, startOfMonth } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ProductSalesData {
  productId: number;
  name: string;
  total: number;
  quantity: number;
}

interface SalesByDate {
  date: string;
  total: number;
  orders: number;
}

interface ProductTrendChartProps {
  salesByProduct: ProductSalesData[];
  salesByDate: SalesByDate[];
  valueFormatter?: (value: number) => string;
  topN?: number;
}

// Generate random colors for products
const generateColor = (index: number) => {
  const colors = [
    { border: "rgb(147, 51, 234)", bg: "rgba(147, 51, 234, 0.1)" }, // Purple
    { border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.1)" }, // Blue
    { border: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.1)" }, // Green
    { border: "rgb(245, 158, 11)", bg: "rgba(245, 158, 11, 0.1)" }, // Orange
    { border: "rgb(239, 68, 68)", bg: "rgba(239, 68, 68, 0.1)" }, // Red
    { border: "rgb(139, 92, 246)", bg: "rgba(139, 92, 246, 0.1)" }, // Violet
    { border: "rgb(236, 72, 153)", bg: "rgba(236, 72, 153, 0.1)" }, // Pink
    { border: "rgb(14, 165, 233)", bg: "rgba(14, 165, 233, 0.1)" }, // Sky
    { border: "rgb(34, 197, 94)", bg: "rgba(34, 197, 94, 0.1)" }, // Emerald
    { border: "rgb(251, 146, 60)", bg: "rgba(251, 146, 60, 0.1)" }, // Amber
  ];
  return colors[index % colors.length];
};

export default function ProductTrendChart({
  salesByProduct,
  salesByDate,
  valueFormatter = (v) => `$${v.toFixed(2)}`,
  topN = 5,
}: ProductTrendChartProps) {
  // Get top N products by total sales
  const topProducts = salesByProduct.slice(0, topN);

  // Group sales by month
  const monthlyData = new Map<string, Map<number, number>>();

  // Initialize all months
  salesByDate.forEach((sale) => {
    const monthKey = format(startOfMonth(parseISO(sale.date)), "yyyy-MM");
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, new Map());
      // Initialize all products with 0 for this month
      topProducts.forEach((product) => {
        monthlyData.get(monthKey)!.set(product.productId, 0);
      });
    }
  });

  // In reality, we need actual product sales per date data
  // For now, we'll distribute the total sales evenly across the date range
  // This is a simplified approach - ideally the API should return salesByProductByDate
  const months = Array.from(monthlyData.keys()).sort();

  // Create datasets for each product
  const datasets = topProducts.map((product, index) => {
    const color = generateColor(index);
    // Distribute product sales across months (simplified)
    const monthlyValues = months.map(() => {
      // This is a placeholder - ideally we'd have actual monthly data
      return product.total / months.length;
    });

    return {
      label: product.name,
      data: monthlyValues,
      borderColor: color.border,
      backgroundColor: color.bg,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      fill: false,
    };
  });

  const chartData = {
    labels: months.map((month) => format(parseISO(`${month}-01`), "MMM yyyy")),
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
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
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
          maxRotation: 45,
          minRotation: 45,
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
