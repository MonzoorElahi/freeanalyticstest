"use client";

import { Bar } from "react-chartjs-2";
import { formatCurrency } from "@/lib/formatters";
import { Building2 } from "lucide-react";

interface VendorData {
  vendor: string;
  total: number;
  count: number;
  avgTransaction: number;
}

interface VendorAnalyticsChartProps {
  data: VendorData[];
  currency?: string;
}

export default function VendorAnalyticsChart({ data, currency = "EUR" }: VendorAnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No vendor data available
      </div>
    );
  }

  // Sort by total and take top 10
  const sortedData = [...data].sort((a, b) => b.total - a.total).slice(0, 10);

  const chartData = {
    labels: sortedData.map((d) => d.vendor),
    datasets: [
      {
        label: "Total Spent",
        data: sortedData.map((d) => d.total),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        borderRadius: 6,
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
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const vendor = sortedData[index];
            return [
              `Total: ${formatCurrency(vendor.total, currency)}`,
              `Transactions: ${vendor.count}`,
              `Avg per transaction: ${formatCurrency(vendor.avgTransaction, currency)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (value: any) => formatCurrency(value, currency),
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Calculate total spend across all vendors
  const totalSpend = data.reduce((sum, v) => sum + v.total, 0);
  const totalTransactions = data.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-300 mb-1">Total Vendors</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">{data.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(totalSpend, currency)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {totalTransactions}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {/* Top Vendor Highlight */}
      {sortedData.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-900 dark:text-amber-100" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                🏆 Top Vendor
              </p>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {sortedData[0].vendor}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {formatCurrency(sortedData[0].total, currency)} across {sortedData[0].count} transactions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
