"use client";

import { CheckCircle, AlertTriangle, Info, Lightbulb, TrendingUp, TrendingDown } from "lucide-react";
import type { MailChimpInsight } from "@/types";
import { formatNumber, formatPercentage } from "@/lib/formatters";

interface MailChimpInsightsProps {
  insights: MailChimpInsight[];
}

export default function MailChimpInsights({ insights }: MailChimpInsightsProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-700",
          iconColor: "text-green-600 dark:text-green-400",
          textColor: "text-green-900 dark:text-green-100",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-700",
          iconColor: "text-orange-600 dark:text-orange-400",
          textColor: "text-orange-900 dark:text-orange-100",
        };
      case "info":
        return {
          icon: Info,
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-700",
          iconColor: "text-blue-600 dark:text-blue-400",
          textColor: "text-blue-900 dark:text-blue-100",
        };
      case "tip":
      default:
        return {
          icon: Lightbulb,
          bg: "bg-purple-50 dark:bg-purple-900/20",
          border: "border-purple-200 dark:border-purple-700",
          iconColor: "text-purple-600 dark:text-purple-400",
          textColor: "text-purple-900 dark:text-purple-100",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Insights & Recommendations
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const { icon: Icon, bg, border, iconColor, textColor } = getIconAndColor(insight.type);
          const TrendIcon = insight.trend === "up" ? TrendingUp : insight.trend === "down" ? TrendingDown : null;

          return (
            <div
              key={idx}
              className={`${bg} ${border} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`${iconColor} mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-semibold ${textColor}`}>{insight.title}</h4>
                    {TrendIcon && (
                      <TrendIcon className={`w-4 h-4 ${insight.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{insight.description}</p>
                  {insight.metric !== undefined && (
                    <div className="mt-2">
                      <span className={`text-lg font-bold ${iconColor}`}>
                        {insight.type === "success" || insight.type === "warning"
                          ? formatPercentage(insight.metric)
                          : formatNumber(insight.metric)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
