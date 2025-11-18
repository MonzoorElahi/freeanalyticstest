"use client";

import { Mail, DollarSign, ShoppingCart, TrendingUp, Eye, MousePointer, AlertTriangle, Target } from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";
import { format, parseISO } from "date-fns";

interface MailChimpMetricsProps {
  totalMetrics: {
    totalRevenue: number;
    totalOrders: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalEmailsSent: number;
    avgBounceRate: number;
    conversionRate: number;
  };
  topCampaigns: {
    id: string;
    title: string;
    revenue: number;
    orders: number;
    openRate: number;
    clickRate: number;
    sendTime: string;
    emailsSent: number;
    bounceRate: number;
  }[];
  currency?: string;
}

export default function MailChimpMetrics({
  totalMetrics,
  topCampaigns,
  currency = "EUR",
}: MailChimpMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Total Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalMetrics.totalRevenue, currency)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(totalMetrics.totalOrders)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Emails Sent</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(totalMetrics.totalEmailsSent)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Open Rate</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(totalMetrics.avgOpenRate * 100)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-4 h-4 text-pink-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Click Rate</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(totalMetrics.avgClickRate * 100)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Bounce Rate</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(totalMetrics.avgBounceRate * 100)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Conversion Rate</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(totalMetrics.conversionRate * 100)}
          </p>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      {topCampaigns && topCampaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Email Campaigns
            </h3>
          </div>
          <div className="space-y-3">
            {topCampaigns.slice(0, 5).map((campaign, idx) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : idx === 1
                        ? "bg-gray-100 text-gray-700"
                        : idx === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {campaign.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(parseISO(campaign.sendTime), "MMM d, yyyy")} • {campaign.orders} orders
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(campaign.revenue, currency)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatPercentage(campaign.openRate * 100)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      {formatPercentage(campaign.clickRate * 100)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
