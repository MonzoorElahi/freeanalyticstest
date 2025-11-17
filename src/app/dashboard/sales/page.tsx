"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Package,
  Percent,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  Sparkles,
  Euro,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";
import SalesChart from "@/components/charts/SalesChart";
import ProductSalesChart from "@/components/charts/ProductSalesChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import { DashboardSkeleton } from "@/components/Skeleton";

interface SalesAnalytics {
  metrics: {
    revenueGrowth: number;
    ordersGrowth: number;
  };
  salesData: {
    grossSales: number;
    netSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalRefunds: number;
    totalShipping: number;
    totalTax: number;
    totalDiscount: number;
    itemsSold: number;
    avgItemsPerOrder: number;
    ordersByStatus: Record<string, number>;
    salesByDate: { date: string; total: number; orders: number }[];
    salesByProduct: { productId: number; name: string; total: number; quantity: number }[];
    topProducts: { name: string; sales: number; quantity: number }[];
    salesByPaymentMethod: { method: string; total: number; count: number }[];
    salesByCountry: { country: string; total: number; orders: number }[];
    hourlyDistribution: { hour: number; orders: number; revenue: number }[];
  };
  currency: string;
}

export default function SalesPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesAnalytics | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [productMetric, setProductMetric] = useState<"sales" | "quantity">("sales");
  const [activeView, setActiveView] = useState<"overview" | "breakdown" | "trends">("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/woocommerce/analytics?days=${days}`);
      const result = await response.json();

      // Handle both old and new standardized API response format
      const analyticsData = result.success ? result.data : result;
      setData(analyticsData);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) return <DashboardSkeleton />;
  if (!data) return null;

  const { metrics, salesData, currency } = data;

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    subtitle,
    color = "purple",
    delay = 0,
  }: {
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    subtitle?: string;
    color?: string;
    delay?: number;
  }) => {
    const isPositive = change !== undefined && change >= 0;
    const colorClasses: Record<string, string> = {
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
      yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    };

    return (
      <div
        className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:scale-105 animate-slideUp cursor-pointer"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isPositive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {formatPercentage(change)}
            </div>
          )}
        </div>
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sales Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Comprehensive breakdown of your store&apos;s sales performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all hover:shadow-lg active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {["overview", "breakdown", "trends"].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view as typeof activeView)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === view
                ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          title="Net Sales"
          value={formatCurrency(salesData.netSales, currency)}
          change={metrics.revenueGrowth}
          icon={Euro}
          color="green"
          delay={0}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(salesData.totalOrders)}
          change={metrics.ordersGrowth}
          icon={ShoppingCart}
          color="blue"
          delay={100}
        />
        <MetricCard
          title="Average Order"
          value={formatCurrency(salesData.averageOrderValue, currency)}
          icon={Receipt}
          color="purple"
          delay={200}
        />
        <MetricCard
          title="Items Sold"
          value={formatNumber(salesData.itemsSold)}
          icon={Package}
          subtitle={`${formatNumber(salesData.avgItemsPerOrder)} items/order`}
          color="orange"
          delay={300}
        />
        <MetricCard
          title="Total Tax"
          value={formatCurrency(salesData.totalTax, currency)}
          icon={Percent}
          color="yellow"
          delay={400}
        />
        <MetricCard
          title="Shipping Revenue"
          value={formatCurrency(salesData.totalShipping, currency)}
          icon={TrendingUp}
          color="blue"
          delay={500}
        />
      </div>

      {activeView === "overview" && (
        <>
          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    chartType === "line"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    chartType === "bar"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>
            <SalesChart data={salesData.salesByDate} type={chartType} />
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products Performance</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setProductMetric("sales")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    productMetric === "sales"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  By Revenue
                </button>
                <button
                  onClick={() => setProductMetric("quantity")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    productMetric === "quantity"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  By Quantity
                </button>
              </div>
            </div>
            <ProductSalesChart
              data={salesData.topProducts.slice(0, 10)}
              metric={productMetric}
            />
          </div>
        </>
      )}

      {activeView === "breakdown" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <DoughnutChart
              labels={salesData.salesByPaymentMethod.map((pm) => pm.method)}
              data={salesData.salesByPaymentMethod.map((pm) => pm.total)}
              title=""
            />
            <div className="mt-4 space-y-2">
              {salesData.salesByPaymentMethod.map((pm, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pm.method}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(pm.total, currency)}</div>
                    <div className="text-xs text-gray-500">{pm.count} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Country */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales by Country</h3>
            <div className="space-y-3">
              {salesData.salesByCountry.slice(0, 8).map((country, i) => {
                const maxSales = Math.max(...salesData.salesByCountry.map(c => c.total));
                const percentage = (country.total / maxSales) * 100;
                return (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{country.country}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(country.total, currency)}</div>
                        <div className="text-xs text-gray-500">{country.orders} orders</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 group-hover:from-purple-600 group-hover:to-purple-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Gross Sales", value: salesData.grossSales, color: "text-green-600 dark:text-green-400" },
                { label: "Tax Collected", value: salesData.totalTax, color: "text-blue-600 dark:text-blue-400" },
                { label: "Shipping", value: salesData.totalShipping, color: "text-purple-600 dark:text-purple-400" },
                { label: "Discounts", value: salesData.totalDiscount, color: "text-orange-600 dark:text-orange-400" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all hover:scale-105">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{item.label}</div>
                  <div className={`text-xl font-bold ${item.color}`}>{formatCurrency(item.value, currency)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === "trends" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Hourly Sales Distribution</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {salesData.hourlyDistribution.map((hour) => {
              const maxRevenue = Math.max(...salesData.hourlyDistribution.map(h => h.revenue));
              const heightPercentage = maxRevenue > 0 ? (hour.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={hour.hour} className="flex flex-col items-center group">
                  <div className="relative w-full h-32 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md transition-all duration-300 group-hover:from-purple-600 group-hover:to-purple-500 cursor-pointer"
                      style={{ height: `${heightPercentage}%` }}
                      title={`${hour.orders} orders - ${formatCurrency(hour.revenue, currency)}`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">{hour.hour}h</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{hour.orders}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
