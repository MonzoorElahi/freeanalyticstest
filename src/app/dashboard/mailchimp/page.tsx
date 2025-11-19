"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, DollarSign, Users, Calendar, Target, Package, ShoppingCart, Eye, Settings, BarChart3, Globe, Monitor, Award, RefreshCw, Download, Clock, FileText } from "lucide-react";
import { formatDateRange, formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import MailChimpRevenueChart from "@/components/charts/MailChimpRevenueChart";
import MailChimpEbookChart from "@/components/charts/MailChimpEbookChart";
import MailChimpMetrics from "@/components/MailChimpMetrics";
import EngagementFunnelChart from "@/components/charts/EngagementFunnelChart";
import SubscriberGrowthChart from "@/components/charts/SubscriberGrowthChart";
import MailChimpInsights from "@/components/MailChimpInsights";
import CampaignPerformanceByDayChart from "@/components/charts/CampaignPerformanceByDayChart";
import EmailClientChart from "@/components/charts/EmailClientChart";
import DeviceStatsChart from "@/components/charts/DeviceStatsChart";
import LocationStatsChart from "@/components/charts/LocationStatsChart";
import EmailHealthScoreCard from "@/components/EmailHealthScoreCard";
import CampaignScoresTable from "@/components/CampaignScoresTable";
import TimeOfDayChart from "@/components/charts/TimeOfDayChart";
import SubjectLineAnalysisChart from "@/components/charts/SubjectLineAnalysisChart";
import CampaignDetailModal from "@/components/CampaignDetailModal";
import type { MailChimpAnalytics, MailChimpCampaign, MailChimpReport } from "@/types";

type TabType = "overview" | "analytics" | "audience" | "campaigns";

export default function MailChimpPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MailChimpAnalytics | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [mailchimpMetric, setMailchimpMetric] = useState<"revenue" | "orders">("revenue");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<{ campaign: MailChimpCampaign; report: MailChimpReport } | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const currency = "EUR";

  // Check if API key is stored
  useEffect(() => {
    const storedApiKey = localStorage.getItem("mailchimp_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsConfigured(true);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  // Fetch data when API key is available
  const fetchData = useCallback(async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/mailchimp/analytics?days=${days}`, {
        headers: {
          "x-mailchimp-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch MailChimp analytics");
      }

      const result = await response.json();
      setData(result.success ? result.data : result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching MailChimp data:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey, days]);

  // Fetch data when configured
  useEffect(() => {
    if (isConfigured && apiKey) {
      fetchData();
    }
  }, [isConfigured, apiKey, fetchData]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey && apiKey.includes("-")) {
      localStorage.setItem("mailchimp_api_key", apiKey);
      setIsConfigured(true);
      setShowApiKeyInput(false);
    } else {
      alert("Please enter a valid MailChimp API key (format: xxxxx-usX)");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("mailchimp_api_key");
    setApiKey("");
    setIsConfigured(false);
    setShowApiKeyInput(true);
    setData(null);
  };

  const handleExport = () => {
    if (!data) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange: dateRange,
      totalMetrics: data.totalMetrics,
      campaigns: data.campaignScores?.map((c) => ({
        title: c.campaignTitle,
        overallScore: c.overallScore,
        openRateScore: c.openRateScore,
        clickRateScore: c.clickRateScore,
        conversionScore: c.conversionScore,
      })),
      emailHealthScore: data.emailHealthScore,
    };

    const csv = [
      ["MailChimp Analytics Export"],
      [`Export Date: ${new Date().toLocaleString()}`],
      [],
      ["Total Metrics"],
      ["Metric", "Value"],
      ["Total Revenue", formatCurrency(data.totalMetrics.totalRevenue, currency)],
      ["Total Orders", data.totalMetrics.totalOrders.toString()],
      ["Emails Sent", data.totalMetrics.totalEmailsSent.toString()],
      ["Avg Open Rate", `${(data.totalMetrics.avgOpenRate * 100).toFixed(2)}%`],
      ["Avg Click Rate", `${(data.totalMetrics.avgClickRate * 100).toFixed(2)}%`],
      ["Bounce Rate", `${(data.totalMetrics.avgBounceRate * 100).toFixed(2)}%`],
      ["Conversion Rate", `${(data.totalMetrics.conversionRate * 100).toFixed(2)}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mailchimp-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dateOptions = [
    { value: 7, label: "Last 7 days" },
    { value: 30, label: "Last 30 days" },
    { value: 60, label: "Last 60 days" },
    { value: 90, label: "Last 90 days" },
  ];

  const dateRange = data?.revenueByDate?.[0]
    ? {
        start: data.revenueByDate[0].date,
        end: data.revenueByDate[data.revenueByDate.length - 1].date,
      }
    : null;

  // API Key Input Form
  if (showApiKeyInput || !isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Connect MailChimp
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your MailChimp API key to view email marketing analytics
                </p>
              </div>
            </div>

            <form onSubmit={handleApiKeySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  MailChimp API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key (e.g., xxxxxxxxxxxxx-us7)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Format: xxxxxxxxxxxxx-usX (where X is your server number)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to get your API key:
                </h3>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Log into your MailChimp account</li>
                  <li>Click your profile icon → Account & Billing</li>
                  <li>Go to Extras → API keys</li>
                  <li>Click "Create A Key"</li>
                  <li>Copy the API key and paste it above</li>
                </ol>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
              >
                Connect MailChimp
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Email Marketing Analytics
            </h1>
            <p className="text-purple-100">
              {dateRange && `${formatDateRange(dateRange.start, dateRange.end)} • `}
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()} • `}
              Powered by MailChimp
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium backdrop-blur-sm"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleExport}
              disabled={!data}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              <Settings className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {!loading && !data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Unable to fetch MailChimp analytics. Please check your API key.
          </p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      {data && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: "overview" as TabType, label: "Overview", icon: BarChart3 },
              { id: "analytics" as TabType, label: "Analytics", icon: Target },
              { id: "audience" as TabType, label: "Audience", icon: Globe },
              { id: "campaigns" as TabType, label: "Campaigns", icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Email Health Score */}
              {data.emailHealthScore && (
                <EmailHealthScoreCard emailHealthScore={data.emailHealthScore} />
              )}

              {/* MailChimp Metrics */}
              <MailChimpMetrics
                totalMetrics={data.totalMetrics}
                topCampaigns={data.topCampaigns}
                currency={currency}
              />

              {/* AI-Powered Insights */}
              {data.insights && data.insights.length > 0 && (
                <MailChimpInsights insights={data.insights} />
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Funnel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Email Engagement Funnel
                  </h3>
                  <EngagementFunnelChart data={data.engagementFunnel} />
                </div>

                {/* Campaign Performance by Day */}
                {data.campaignsByDay && data.campaignsByDay.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Best Days to Send
                    </h3>
                    <CampaignPerformanceByDayChart data={data.campaignsByDay} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Time of Day Optimization */}
              {data.timeOfDayStats && data.timeOfDayStats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Optimal Send Time Analysis
                  </h3>
                  <TimeOfDayChart data={data.timeOfDayStats} />
                </div>
              )}

              {/* Subject Line Analysis */}
              {data.subjectLineAnalysis && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Subject Line Performance
                  </h3>
                  <SubjectLineAnalysisChart data={data.subjectLineAnalysis} />
                </div>
              )}

              {/* Subscriber Growth */}
              {data.subscriberGrowth && data.subscriberGrowth.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Subscriber Growth & Churn
                  </h3>
                  <SubscriberGrowthChart data={data.subscriberGrowth} />
                </div>
              )}

              {/* Revenue from Email Campaigns */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Revenue from Email Campaigns
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMailchimpMetric("revenue")}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        mailchimpMetric === "revenue"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setMailchimpMetric("orders")}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        mailchimpMetric === "orders"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Orders
                    </button>
                  </div>
                </div>
                <MailChimpRevenueChart
                  data={data.revenueByDate}
                  currency={currency}
                  metric={mailchimpMetric}
                />
              </div>

              {/* Ebook Downloads */}
              {data.ebookDownloads && data.ebookDownloads.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Ebook Downloads from Email Campaigns
                  </h3>
                  <MailChimpEbookChart data={data.ebookDownloads} currency={currency} />
                </div>
              )}

              {/* Product Sales from Email */}
              {data.productSales && data.productSales.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Top Products Sold via Email Campaigns
                  </h3>
                  <div className="space-y-3">
                    {data.productSales.slice(0, 10).map((product, idx) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.productName}
                            </p>
                            <p className="text-xs text-gray-500">{product.quantity} sold</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-green-600">
                          €{product.revenue.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audience Tab */}
          {activeTab === "audience" && (
            <div className="space-y-6">
              {/* Device Stats */}
              {data.deviceStats && data.deviceStats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-purple-600" />
                    Device Breakdown
                  </h3>
                  <DeviceStatsChart data={data.deviceStats} />
                </div>
              )}

              {/* Location Stats */}
              {data.locationStats && data.locationStats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Geographic Distribution
                  </h3>
                  <LocationStatsChart data={data.locationStats} currency={currency} />
                </div>
              )}

              {/* Email Client Stats */}
              {data.emailClients && data.emailClients.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Email Client Usage
                  </h3>
                  <EmailClientChart data={data.emailClients} />
                </div>
              )}
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div className="space-y-6">
              {/* Campaign Scores */}
              {data.campaignScores && data.campaignScores.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Campaign Performance Scores
                  </h3>
                  <CampaignScoresTable scores={data.campaignScores} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    💡 Tip: View detailed campaign analytics in the campaigns list from your MailChimp dashboard
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
          campaign={selectedCampaign.campaign}
          report={selectedCampaign.report}
          currency={currency}
        />
      )}
    </div>
  );
}
