"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  Megaphone,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Percent,
  Clock,
  MapPin,
  CreditCard,
  UserPlus,
  UserCheck,
  Sparkles,
  Target,
  Calendar,
  Filter,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage, formatDateRange } from "@/lib/formatters";
import SalesChart from "./charts/SalesChart";
import ProductSalesChart from "./charts/ProductSalesChart";
import CustomerChart from "./charts/CustomerChart";
import DoughnutChart from "./charts/DoughnutChart";
import ExportButton from "./ExportButton";
import ComparisonChart from "./charts/ComparisonChart";
import GoalIndicator from "./GoalIndicator";
import { DashboardSkeleton } from "./Skeleton";
import QuickInsights from "./QuickInsights";
import LiveIndicator from "./LiveIndicator";

interface AnalyticsResponse {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
  };
  salesData: {
    grossSales: number;
    netSales: number;
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalRefunds: number;
    totalShipping: number;
    totalTax: number;
    totalDiscount: number;
    itemsSold: number;
    avgItemsPerOrder: number;
    ordersByStatus: Record<string, number>;
    revenueByDay: { date: string; gross: number; net: number; orders: number; items: number }[];
    salesByDate: { date: string; total: number; orders: number }[];
    salesByProduct: { productId: number; name: string; total: number; quantity: number }[];
    topProducts: { name: string; sales: number; quantity: number }[];
    salesByCategory: { category: string; total: number; quantity: number }[];
    salesByCountry: { country: string; total: number; orders: number }[];
    salesByPaymentMethod: { method: string; total: number; count: number }[];
    hourlyDistribution: { hour: number; orders: number; revenue: number }[];
  };
  customerData: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    newCustomersFromAds: number;
    customersByDate: { date: string; count: number }[];
    customerRetention: number;
    topCustomers: { id: number; name: string; totalSpent: number; ordersCount: number }[];
    guestOrders: number;
    avgOrdersPerCustomer: number;
    avgCustomerLifetimeValue: number;
    customersByCountry: { country: string; count: number }[];
    newVsReturning: { type: string; count: number; revenue: number }[];
    adsAttribution: { source: string; count: number; revenue: number }[];
  };
  compareSalesData: {
    netSales: number;
    totalOrders: number;
    revenueByDay?: { date: string; gross: number; net: number; orders: number; items: number }[];
  };
  compareCustomerData: {
    newCustomers: number;
  };
  currency: string;
  dateRange: {
    start: string;
    end: string;
    days: number;
    compareStart: string;
    compareEnd: string;
    compareType: string;
  };
  frequentlyBoughtTogether?: {
    product1: { id: number; name: string };
    product2: { id: number; name: string };
    frequency: number;
    confidence: number;
    lift: number;
  }[];
  customerSegments?: {
    segment: string;
    description: string;
    count: number;
    revenue: number;
    avgOrderValue: number;
    color: string;
  }[];
  revenueForecast?: {
    date: string;
    projectedRevenue: number;
    lowerBound: number;
    upperBound: number;
  }[];
}

export default function DashboardContent() {
  const [days, setDays] = useState(30);
  const [compareType, setCompareType] = useState<"previous" | "year">("previous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sales" | "customers">("overview");
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/woocommerce/analytics?days=${days}&compare=${compareType}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const result = await response.json();

      // Handle both old and new standardized API response format
      const analyticsData = result.success ? result.data : result;
      setData(analyticsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [days, compareType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, salesData, customerData, currency, dateRange } = data;

  const dateOptions = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 14 days", value: 14 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 60 days", value: 60 },
    { label: "Last 90 days", value: 90 },
  ];

  const MetricCardLarge = ({
    title,
    value,
    change,
    icon: Icon,
    subtitle,
    compareLabel,
    delay = 0,
  }: {
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    subtitle?: string;
    compareLabel?: string;
    delay?: number;
  }) => {
    const isPositive = change !== undefined && change >= 0;
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp group"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
            <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium animate-fadeIn ${
                isPositive
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {formatPercentage(change)}
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tabular-nums">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
        {compareLabel && change !== undefined && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{compareLabel}</p>
        )}
      </div>
    );
  };

  const SmallMetric = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string;
    icon: React.ElementType;
  }) => (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  const compareLabel =
    compareType === "year"
      ? `vs. same period last year`
      : `vs. previous ${days} days`;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <LiveIndicator lastUpdated={lastUpdated} isRefreshing={loading} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDateRange(dateRange.start, dateRange.end)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-400"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Type */}
          <select
            value={compareType}
            onChange={(e) => setCompareType(e.target.value as "previous" | "year")}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-400"
          >
            <option value="previous">vs. Previous Period</option>
            <option value="year">vs. Last Year</option>
          </select>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              autoRefresh
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-400"
            }`}
            title={autoRefresh ? "Auto-refresh enabled (5min)" : "Enable auto-refresh"}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            Auto
          </button>

          {/* Export Button */}
          <ExportButton days={days} startDate={dateRange.start} endDate={dateRange.end} />

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-all hover:shadow-lg active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCardLarge
          title="Net Sales"
          value={formatCurrency(salesData.netSales, currency)}
          change={metrics.revenueGrowth}
          icon={DollarSign}
          subtitle={`Gross: ${formatCurrency(salesData.grossSales, currency)}`}
          compareLabel={compareLabel}
          delay={0}
        />
        <MetricCardLarge
          title="Orders"
          value={formatNumber(salesData.totalOrders)}
          change={metrics.ordersGrowth}
          icon={ShoppingCart}
          subtitle={`${formatNumber(salesData.itemsSold)} items sold`}
          compareLabel={compareLabel}
          delay={100}
        />
        <MetricCardLarge
          title="New Customers"
          value={formatNumber(customerData.newCustomers)}
          change={metrics.customersGrowth}
          icon={UserPlus}
          subtitle={`${formatNumber(customerData.returningCustomers)} returning`}
          compareLabel={compareLabel}
          delay={200}
        />
        <MetricCardLarge
          title="Avg Order Value"
          value={formatCurrency(salesData.averageOrderValue, currency)}
          icon={Receipt}
          subtitle={`${formatNumber(salesData.avgItemsPerOrder, 1)} items/order`}
          delay={300}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <SmallMetric
          label="Total Tax"
          value={formatCurrency(salesData.totalTax, currency)}
          icon={Percent}
        />
        <SmallMetric
          label="Total Shipping"
          value={formatCurrency(salesData.totalShipping, currency)}
          icon={Package}
        />
        <SmallMetric
          label="Total Discounts"
          value={formatCurrency(salesData.totalDiscount, currency)}
          icon={Receipt}
        />
        <SmallMetric
          label="Total Refunds"
          value={formatCurrency(salesData.totalRefunds, currency)}
          icon={TrendingDown}
        />
        <SmallMetric
          label="Guest Orders"
          value={formatNumber(customerData.guestOrders)}
          icon={Users}
        />
        <SmallMetric
          label="Customer LTV"
          value={formatCurrency(customerData.avgCustomerLifetimeValue, currency)}
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "sales", label: "Sales Details", icon: DollarSign },
          { id: "customers", label: "Customer Insights", icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "overview" | "sales" | "customers")}
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Goals / Targets Section */}
          {data.compareSalesData && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance vs Target
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  (Target: 10% growth over {compareType === "year" ? "last year" : "previous period"})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GoalIndicator
                  label="Revenue Target"
                  current={salesData.netSales}
                  target={data.compareSalesData.netSales * 1.1}
                  currency={currency}
                />
                <GoalIndicator
                  label="Orders Target"
                  current={salesData.totalOrders}
                  target={Math.ceil(data.compareSalesData.totalOrders * 1.1)}
                />
                <GoalIndicator
                  label="New Customers Target"
                  current={customerData.newCustomers}
                  target={Math.ceil(data.compareCustomerData.newCustomers * 1.1)}
                />
              </div>
            </div>
          )}

          {/* Quick Insights */}
          <QuickInsights
            revenueGrowth={metrics.revenueGrowth}
            ordersGrowth={metrics.ordersGrowth}
            customersGrowth={metrics.customersGrowth}
            avgOrderValue={salesData.averageOrderValue}
            topProductName={salesData.topProducts[0]?.name}
          />

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue & Orders Trend
            </h3>
            {salesData.salesByDate.length > 0 ? (
              <SalesChart data={salesData.salesByDate} showOrders={true} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No sales data for this period
              </div>
            )}
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Products by Revenue
              </h3>
              {salesData.topProducts.length > 0 ? (
                <ProductSalesChart data={salesData.topProducts} metric="sales" />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  No product data
                </div>
              )}
            </div>

            {/* Order Attribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order Attribution
                </h3>
              </div>
              {customerData.adsAttribution.length > 0 ? (
                <>
                  <DoughnutChart
                    labels={customerData.adsAttribution.map((a) => a.source)}
                    data={customerData.adsAttribution.map((a) => a.count)}
                    title="Orders by Source"
                  />
                  <div className="mt-4 space-y-2">
                    {customerData.adsAttribution.slice(0, 5).map((attr) => (
                      <div
                        key={attr.source}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400">{attr.source}</span>
                        <div className="text-right">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {attr.count} orders
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({formatCurrency(attr.revenue, currency)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No attribution data
                </div>
              )}
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              New Customer Acquisition
            </h3>
            {customerData.customersByDate.length > 0 ? (
              <CustomerChart data={customerData.customersByDate} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No new customers in this period
              </div>
            )}
          </div>

          {/* Revenue Forecast */}
          {data.revenueForecast && data.revenueForecast.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenue Forecast (Next 7 Days)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Projected</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.revenueForecast.map((forecast) => (
                      <tr key={forecast.date}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {new Date(forecast.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-purple-600">
                          {formatCurrency(forecast.projectedRevenue, currency)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(forecast.lowerBound, currency)} - {formatCurrency(forecast.upperBound, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Frequently Bought Together */}
          {data.frequentlyBoughtTogether && data.frequentlyBoughtTogether.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Frequently Bought Together
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.frequentlyBoughtTogether.slice(0, 6).map((pair, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {pair.product1.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>+</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      {pair.product2.name}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                        <p className="text-sm font-semibold text-purple-600">{pair.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                        <p className="text-sm font-semibold text-green-600">{formatPercentage(pair.confidence)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Lift</p>
                        <p className="text-sm font-semibold text-blue-600">{pair.lift.toFixed(2)}x</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Segments */}
          {data.customerSegments && data.customerSegments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Customer Segmentation
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {data.customerSegments.map((segment) => (
                  <div
                    key={segment.segment}
                    className="p-4 rounded-lg border-2"
                    style={{ borderColor: segment.color }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {segment.segment}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {segment.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Customers</span>
                        <span className="font-medium text-gray-900 dark:text-white">{segment.count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Revenue</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(segment.revenue, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Avg Order</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(segment.avgOrderValue, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Period Comparison Chart */}
          {data.compareSalesData.revenueByDay && data.compareSalesData.revenueByDay.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Comparison: {compareType === "year" ? "Year over Year" : "Period over Period"}
              </h3>
              <ComparisonChart
                currentData={salesData.revenueByDay.map((d) => ({ date: d.date, value: d.net }))}
                previousData={data.compareSalesData.revenueByDay.map((d) => ({ date: d.date, value: d.net }))}
                currentLabel={`Current Period (${formatDateRange(dateRange.start, dateRange.end)})`}
                previousLabel={`${compareType === "year" ? "Last Year" : "Previous"} Period`}
                valueFormatter={(v) => formatCurrency(v, currency)}
              />
            </div>
          )}

          {/* Order Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Orders by Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(salesData.ordersByStatus).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Payment Method */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Methods
                </h3>
              </div>
              <div className="space-y-3">
                {salesData.salesByPaymentMethod.map((method) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{method.method}</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(method.total, currency)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        ({method.count} orders)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sales by Country
                </h3>
              </div>
              <div className="space-y-3">
                {salesData.salesByCountry.slice(0, 10).map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{country.country}</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(country.total, currency)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        ({country.orders} orders)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Orders by Hour of Day
              </h3>
            </div>
            <div className="grid grid-cols-12 gap-2">
              {salesData.hourlyDistribution.map((hour) => {
                const maxOrders = Math.max(...salesData.hourlyDistribution.map((h) => h.orders));
                const height = maxOrders > 0 ? (hour.orders / maxOrders) * 100 : 0;
                return (
                  <div key={hour.hour} className="flex flex-col items-center">
                    <div className="h-24 w-full bg-gray-100 dark:bg-gray-700 rounded relative">
                      <div
                        className="absolute bottom-0 w-full bg-purple-500 rounded transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{hour.hour}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {hour.orders}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          {/* New vs Returning */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  New vs Returning Customers
                </h3>
              </div>
              <div className="space-y-4">
                {customerData.newVsReturning.map((item) => (
                  <div key={item.type} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{item.type}</span>
                      <span className="text-lg font-bold text-purple-600">{item.count}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Revenue: {formatCurrency(item.revenue, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Customers by Country
                </h3>
              </div>
              <div className="space-y-3">
                {customerData.customersByCountry.slice(0, 8).map((item) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{item.country}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatNumber(item.count)} customers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Customers by Lifetime Value
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Avg per Order
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customerData.topCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {customer.ordersCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(customer.totalSpent, currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(customer.totalSpent / customer.ordersCount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
