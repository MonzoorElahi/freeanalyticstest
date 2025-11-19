"use client";

import { Doughnut } from "react-chartjs-2";
import { formatCurrency } from "@/lib/formatters";
import { CreditCard, Banknote, Wallet } from "lucide-react";

interface PaymentMethodData {
  method: string;
  total: number;
  count: number;
  percentage: number;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
  currency?: string;
}

const methodColors: Record<string, string> = {
  "Credit Card": "rgba(139, 92, 246, 0.8)",
  "Debit Card": "rgba(59, 130, 246, 0.8)",
  "Bank Transfer": "rgba(16, 185, 129, 0.8)",
  Cash: "rgba(251, 146, 60, 0.8)",
  PayPal: "rgba(236, 72, 153, 0.8)",
  Other: "rgba(107, 114, 128, 0.8)",
};

const methodIcons: Record<string, any> = {
  "Credit Card": CreditCard,
  "Debit Card": CreditCard,
  "Bank Transfer": Banknote,
  Cash: Wallet,
  PayPal: Wallet,
  Other: Wallet,
};

export default function PaymentMethodChart({ data, currency = "EUR" }: PaymentMethodChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No payment method data available
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.total - a.total);

  const chartData = {
    labels: sortedData.map((d) => d.method),
    datasets: [
      {
        data: sortedData.map((d) => d.total),
        backgroundColor: sortedData.map((d) => methodColors[d.method] || methodColors.Other),
        borderColor: sortedData.map((d) =>
          (methodColors[d.method] || methodColors.Other).replace("0.8", "1")
        ),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
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
          label: (context: any) => {
            const index = context.dataIndex;
            const item = sortedData[index];
            return [
              `Amount: ${formatCurrency(item.total, currency)}`,
              `Transactions: ${item.count}`,
              `Percentage: ${item.percentage.toFixed(1)}%`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Top 3 Payment Methods */}
      <div className="space-y-3">
        {sortedData.slice(0, 3).map((item, idx) => {
          const Icon = methodIcons[item.method] || Wallet;
          const color = (methodColors[item.method] || methodColors.Other).replace("0.8", "1");

          return (
            <div
              key={item.method}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color.replace("1)", "0.2)") }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.method}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.count} transaction{item.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.total, currency)}
                </p>
                <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
