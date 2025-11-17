"use client";

import { TrendingUp, TrendingDown, AlertTriangle, Award, Target, Zap } from "lucide-react";

interface QuickInsightsProps {
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  avgOrderValue: number;
  topProductName?: string;
  lowStockCount?: number;
}

export default function QuickInsights({
  revenueGrowth,
  ordersGrowth,
  customersGrowth,
  avgOrderValue,
  topProductName,
  lowStockCount = 0,
}: QuickInsightsProps) {
  const insights = [];

  // Revenue insight
  if (revenueGrowth > 20) {
    insights.push({
      icon: TrendingUp,
      text: "Exceptional revenue growth!",
      detail: `Revenue increased by ${revenueGrowth.toFixed(1)}% - well above average`,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    });
  } else if (revenueGrowth < -10) {
    insights.push({
      icon: TrendingDown,
      text: "Revenue needs attention",
      detail: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(1)}% - consider running promotions`,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    });
  }

  // Customer growth insight
  if (customersGrowth > 15) {
    insights.push({
      icon: Award,
      text: "Strong customer acquisition",
      detail: `${customersGrowth.toFixed(1)}% more new customers than previous period`,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    });
  } else if (customersGrowth < 0) {
    insights.push({
      icon: Target,
      text: "Focus on customer acquisition",
      detail: "New customer rate is declining - time to boost marketing efforts",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    });
  }

  // AOV insight
  if (avgOrderValue > 100) {
    insights.push({
      icon: Zap,
      text: "High average order value",
      detail: "Customers are spending more per order - great for profitability",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    });
  }

  // Low stock warning
  if (lowStockCount > 5) {
    insights.push({
      icon: AlertTriangle,
      text: `${lowStockCount} products low on stock`,
      detail: "Consider restocking popular items to avoid lost sales",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    });
  }

  // Top product insight
  if (topProductName) {
    insights.push({
      icon: Award,
      text: `Top seller: ${topProductName.substring(0, 30)}${topProductName.length > 30 ? "..." : ""}`,
      detail: "This product is driving most of your revenue",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-purple-600" />
        Quick Insights
      </h3>
      <div className="space-y-3">
        {insights.slice(0, 4).map((insight, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg ${insight.bg} animate-slideUp`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <insight.icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
            <div>
              <p className={`text-sm font-medium ${insight.color}`}>{insight.text}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{insight.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
