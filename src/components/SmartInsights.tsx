"use client";

import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from "lucide-react";

export interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "danger";
  title: string;
  description: string;
  metric?: string;
  impact?: "high" | "medium" | "low";
}

interface SmartInsightsProps {
  insights: Insight[];
  title?: string;
  className?: string;
}

const insightConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-900 dark:text-green-100",
    textColor: "text-green-700 dark:text-green-300",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-900 dark:text-amber-100",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  danger: {
    icon: TrendingDown,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-100",
    textColor: "text-red-700 dark:text-red-300",
  },
};

const impactLabels = {
  high: { label: "High Impact", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  medium: { label: "Medium Impact", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  low: { label: "Low Impact", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

export default function SmartInsights({
  insights,
  title = "Smart Insights",
  className = "",
}: SmartInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recommendations based on your data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const config = insightConfig[insight.type];
          const Icon = config.icon;
          const impactInfo = insight.impact ? impactLabels[insight.impact] : null;

          return (
            <div
              key={insight.id}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${config.titleColor}`}>
                      {insight.title}
                    </p>
                    {impactInfo && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${impactInfo.color}`}>
                        {impactInfo.label}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${config.textColor} mt-1`}>
                    {insight.description}
                  </p>
                  {insight.metric && (
                    <p className={`text-xs ${config.textColor} mt-2 font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded inline-block`}>
                      {insight.metric}
                    </p>
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
