"use client";

import { Clock, TrendingUp, ShoppingCart, Users, Package, DollarSign, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Activity {
  id: string;
  type: "sale" | "order" | "customer" | "product" | "expense" | "email";
  title: string;
  description: string;
  timestamp: string;
  value?: string;
  status?: "success" | "warning" | "info";
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const activityConfig = {
  sale: {
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  order: {
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  customer: {
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  product: {
    icon: Package,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  expense: {
    icon: DollarSign,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  email: {
    icon: Mail,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
};

export default function ActivityFeed({
  activities,
  title = "Recent Activity",
  maxItems = 10,
  className = "",
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {title}
        </h3>
        {activities.length > maxItems && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {maxItems} of {activities.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              {/* Icon */}
              <div className={`${config.bgColor} ${config.color} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  {activity.value && (
                    <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {activity.value}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </p>
              </div>

              {/* Status Indicator */}
              {activity.status && (
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                    activity.status === "success"
                      ? "bg-green-500"
                      : activity.status === "warning"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                />
              )}
            </div>
          );
        })}

        {displayActivities.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
