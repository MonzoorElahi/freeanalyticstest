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
import ComparisonChart from "@/components/charts/ComparisonChart";
import ProductTrendChart from "@/components/charts/ProductTrendChart";
import OrderSourceTrendChart from "@/components/charts/OrderSourceTrendChart";
import NewCustomersChart from "@/components/charts/NewCustomersChart";
import CustomerSourceTrendChart from "@/components/charts/CustomerSourceTrendChart";
import { DashboardSkeleton } from "@/components/Skeleton";
import Sparkline from "@/components/Sparkline";

interface ProductVelocity {
  productId: number;
  name: string;
  totalSales: number;
  avgDailySales: number;
  trend: "increasing" | "decreasing" | "stable";
  daysToSellOut: number | null;
}

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
    revenueByDay: { date: string; gross: number; net: number; orders: number; items: number }[];
    salesByProduct: { productId: number; name: string; total: number; quantity: number }[];
    topProducts: { name: string; sales: number; quantity: number }[];
    salesByCategory: { category: string; total: number; quantity: number }[];
    salesByPaymentMethod: { method: string; total: number; count: number }[];
    salesByCountry: { country: string; total: number; orders: number }[];
    hourlyDistribution: { hour: number; orders: number; revenue: number }[];
  };
  customerData?: {
    adsAttribution: { source: string; count: number; revenue: number }[];
    customersByDate: { date: string; count: number }[];
    orderSourceTrends?: {
      date: string;
      sources: { source: string; count: number; revenue: number }[];
    }[];
    newCustomersBySource?: {
      date: string;
      sources: { source: string; count: number }[];
    }[];
  };
  productVelocity?: ProductVelocity[];
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

  // Prepare trend data for sparklines (last 7-14 days)
  const trendDays = Math.min(days, 14);
  const revenueTrend = salesData.revenueByDay.slice(-trendDays).map((d) => d.net);
  const ordersTrend = salesData.revenueByDay.slice(-trendDays).map((d) => d.orders);
  const itemsSoldTrend = salesData.revenueByDay.slice(-trendDays).map((d) => d.items);

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    subtitle,
    color = "purple",
    delay = 0,
    trendData,
  }: {
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    subtitle?: string;
    color?: string;
    delay?: number;
    trendData?: number[];
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
        className="metric-card p-5 group card-elevated"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl ${colorClasses[color]} smooth-hover group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="w-6 h-6" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                isPositive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              } animate-bounce-in`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {formatPercentage(change)}
            </div>
          )}
        </div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{title}</h3>
        <div className="flex items-end justify-between gap-3 mb-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums group-hover:text-gradient smooth-hover">{value}</p>
          {trendData && trendData.length > 0 && (
            <div className="mb-1">
              <Sparkline data={trendData} width={70} height={24} />
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">{subtitle}</p>}

        {/* Progress indicator line */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full smooth-slow shadow-lg ${
              isPositive
                ? "gradient-success"
                : "gradient-warning"
            } group-hover:w-full transition-all`}
            style={{ width: change !== undefined ? `${Math.min(Math.abs(change), 100)}%` : "50%" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="page-transition space-y-8">
      {/* Header with Breadcrumbs */}
      <div className="glass-strong p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="animate-slide-in-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 gradient-primary rounded-xl shadow-lg animate-float">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">
                Sales Analytics
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-base font-medium">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Comprehensive breakdown of your store&apos;s sales performance
            </p>
          </div>
          <div className="flex items-center gap-3 animate-slide-in-right">
            <div className="glass flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-2.5 shadow-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer focus-ring"
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
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs with improved design */}
      <div className="flex gap-2 p-2 glass rounded-xl w-fit border-2 border-gray-200 dark:border-gray-700">
        {["overview", "breakdown", "trends"].map((view, index) => (
          <button
            key={view}
            onClick={() => setActiveView(view as typeof activeView)}
            className={`px-6 py-3 rounded-lg text-sm font-bold smooth-fast ${
              activeView === view
                ? "gradient-primary text-white shadow-lg scale-105"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <div className="divider-gradient" />

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          title="Net Sales"
          value={formatCurrency(salesData.netSales, currency)}
          change={metrics.revenueGrowth}
          icon={Euro}
          color="green"
          delay={0}
          trendData={revenueTrend}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(salesData.totalOrders)}
          change={metrics.ordersGrowth}
          icon={ShoppingCart}
          color="blue"
          delay={100}
          trendData={ordersTrend}
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
          trendData={itemsSoldTrend}
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
            <SalesChart data={salesData.salesByDate} type={chartType} currency={currency} />
          </div>

          {/* Gross vs Net Revenue Comparison - NEW! */}
          {salesData.revenueByDay && salesData.revenueByDay.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Gross vs Net Revenue
              </h3>
              <ComparisonChart
                currentData={salesData.revenueByDay.map((d) => ({ date: d.date, value: d.gross }))}
                previousData={salesData.revenueByDay.map((d) => ({ date: d.date, value: d.net }))}
                currentLabel="Gross Revenue"
                previousLabel="Net Revenue"
                valueFormatter={(value) => formatCurrency(value, currency)}
              />
            </div>
          )}

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
              currency={currency}
            />
          </div>
        </>
      )}

      {activeView === "breakdown" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Category - NEW! */}
          {salesData.salesByCategory && salesData.salesByCategory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Sales by Category
              </h3>
              <DoughnutChart
                labels={salesData.salesByCategory.map((cat) => cat.category)}
                data={salesData.salesByCategory.map((cat) => cat.total)}
                title=""
              />
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {salesData.salesByCategory.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.category}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cat.total, currency)}</div>
                      <div className="text-xs text-gray-500">{cat.quantity} items</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Traffic Sources - NEW! */}
          {data.customerData?.adsAttribution && data.customerData.adsAttribution.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Traffic Sources & Attribution
              </h3>
              <DoughnutChart
                labels={data.customerData.adsAttribution.map((attr) => attr.source)}
                data={data.customerData.adsAttribution.map((attr) => attr.revenue)}
                title=""
              />
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {data.customerData.adsAttribution.map((attr, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{attr.source}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(attr.revenue, currency)}</div>
                      <div className="text-xs text-gray-500">{attr.count} orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        <>
          {/* Monthly Product Sales Trends - NEW! */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Monthly Sales by Top Products
            </h3>
            <ProductTrendChart
              salesByProduct={salesData.salesByProduct}
              salesByDate={salesData.salesByDate}
              valueFormatter={(value) => formatCurrency(value, currency)}
              topN={5}
            />
          </div>

          {/* Product Velocity Analytics - NEW! */}
          {data.productVelocity && data.productVelocity.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Product Velocity Analytics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Product</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Total Sales</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Avg/Day</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Trend</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Days to Sellout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productVelocity.slice(0, 10).map((product, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-white">{product.totalSales}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{product.avgDailySales.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.trend === "increasing"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : product.trend === "decreasing"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                          }`}>
                            {product.trend === "increasing" ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : product.trend === "decreasing" ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {product.trend}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          {product.daysToSellOut !== null ? (
                            <span className={`font-semibold ${
                              product.daysToSellOut < 7
                                ? "text-red-600 dark:text-red-400"
                                : product.daysToSellOut < 30
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-green-600 dark:text-green-400"
                            }`}>
                              {product.daysToSellOut} days
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hourly Sales Distribution */}
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

          {/* Order Source Trends Over Time - NEW! */}
          {data.customerData?.orderSourceTrends && data.customerData.orderSourceTrends.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Sales by Traffic Source Over Time
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProductMetric("sales")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      productMetric === "sales"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setProductMetric("quantity")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      productMetric === "quantity"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Orders
                  </button>
                </div>
              </div>
              <OrderSourceTrendChart
                data={data.customerData.orderSourceTrends}
                metric={productMetric === "sales" ? "revenue" : "count"}
                currency={currency}
              />
            </div>
          )}

          {/* New Customers Per Day - NEW! */}
          {data.customerData?.customersByDate && data.customerData.customersByDate.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                New Customers Per Day
              </h3>
              <NewCustomersChart data={data.customerData.customersByDate} />
            </div>
          )}

          {/* New Customers by Source Over Time - NEW! */}
          {data.customerData?.newCustomersBySource && data.customerData.newCustomersBySource.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                New Customer Acquisition by Source
              </h3>
              <CustomerSourceTrendChart data={data.customerData.newCustomersBySource} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
