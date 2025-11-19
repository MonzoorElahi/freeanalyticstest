"use client";

import { X, Mail, Users, MousePointer, TrendingUp, DollarSign, Calendar, Award } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { useEffect } from "react";
import type { MailChimpCampaign, MailChimpReport } from "@/types";

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: MailChimpCampaign;
  report: MailChimpReport;
  currency?: string;
}

export default function CampaignDetailModal({
  isOpen,
  onClose,
  campaign,
  report,
  currency = "EUR",
}: CampaignDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate performance grade
  const getPerformanceGrade = () => {
    const openRate = report.opens.open_rate;
    const clickRate = report.clicks.click_rate;

    if (openRate >= 0.25 && clickRate >= 0.05) return { grade: "A+", color: "green" };
    if (openRate >= 0.20 && clickRate >= 0.03) return { grade: "A", color: "green" };
    if (openRate >= 0.15 && clickRate >= 0.02) return { grade: "B", color: "blue" };
    if (openRate >= 0.10 && clickRate >= 0.01) return { grade: "C", color: "amber" };
    return { grade: "D", color: "red" };
  };

  const performance = getPerformanceGrade();
  const revenue = report.ecommerce?.total_revenue || 0;
  const orders = report.ecommerce?.total_orders || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {campaign.settings.subject_line}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {campaign.send_time && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Sent: {new Date(campaign.send_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Award className={`w-4 h-4 text-${performance.color}-600`} />
                    Grade: {performance.grade}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recipients
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(report.emails_sent)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Opens
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(report.opens.unique_opens)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(report.opens.open_rate * 100).toFixed(1)}% open rate
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Clicks
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(report.clicks.unique_clicks)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(report.clicks.click_rate * 100).toFixed(1)}% click rate
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Revenue
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(revenue, currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {orders} order{orders !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Engagement Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Opens:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(report.opens.opens_total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unique Opens:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(report.opens.unique_opens)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Open Rate:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {(report.opens.open_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Clicks:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(report.clicks.clicks_total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unique Clicks:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(report.clicks.unique_clicks)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Click Rate:</span>
                      <span className="text-sm font-bold text-green-600">
                        {(report.clicks.click_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Campaign Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Campaign Type:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {campaign.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Abuse Reports:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(report.abuse_reports || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unsubscribes:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(report.unsubscribed || 0)}
                      </span>
                    </div>
                    {report.ecommerce && (
                      <>
                        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatNumber(report.ecommerce.total_orders)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue:</span>
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(report.ecommerce.total_revenue, currency)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Subject Line:</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {campaign.settings.subject_line}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  From: {campaign.settings.from_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
