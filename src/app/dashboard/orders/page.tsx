"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, Filter, Search, ShoppingCart, DollarSign, Package, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";
import { format, parseISO, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { WooOrder } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { DashboardSkeleton } from "@/components/Skeleton";
import DoughnutChart from "@/components/charts/DoughnutChart";

export default function OrdersPage() {
  const [orders, setOrders] = useState<WooOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currency, setCurrency] = useState("EUR");
  const [days, setDays] = useState(30); // Date range filter

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/woocommerce/orders");
      const data = await response.json();

      // Handle new standardized API response format
      const ordersArray = data.success ? data.data.orders : data.orders || [];
      setOrders(ordersArray);

      if (ordersArray && ordersArray.length > 0) {
        setCurrency(ordersArray[0].currency || "EUR");
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by date range first
  const dateFilteredOrders = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    return orders.filter((order) => {
      const orderDate = parseISO(order.date_created);
      return isAfter(orderDate, startOfDay(startDate)) && isBefore(orderDate, endOfDay(endDate));
    });
  }, [orders, days]);

  const filteredOrders = dateFilteredOrders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.id.toString().includes(searchTerm) ||
      `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.billing.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics from date-filtered orders
  const totalRevenue = dateFilteredOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const avgOrderValue = dateFilteredOrders.length > 0 ? totalRevenue / dateFilteredOrders.length : 0;
  const totalItems = dateFilteredOrders.reduce((sum, o) => sum + o.line_items.reduce((s, i) => s + i.quantity, 0), 0);

  const statusCounts: Record<string, number> = {};
  dateFilteredOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const completedOrders = dateFilteredOrders.filter((o) => o.status === "completed").length;
  const processingOrders = dateFilteredOrders.filter((o) => o.status === "processing").length;
  const pendingOrders = dateFilteredOrders.filter((o) => o.status === "pending").length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "on-hold": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <Clock className="w-4 h-4" />;
      case "cancelled":
      case "failed": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading && orders.length === 0) return <DashboardSkeleton />;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-purple-600" />
            Orders Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and analyze orders from the last {days} days
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
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
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-all hover:shadow-lg active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-500">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dateFilteredOrders.length)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500">Avg Order Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgOrderValue, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-500">Items Sold</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(totalItems)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500">Processing</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{processingOrders}</p>
        </div>
      </div>

      {/* Status Distribution */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status Distribution</h3>
            <DoughnutChart labels={Object.keys(statusCounts)} data={Object.values(statusCounts)} title="" />
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = dateFilteredOrders.length > 0 ? (count / dateFilteredOrders.length) * 100 : 0;
                return (
                  <div key={status} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{status}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Statuses ({orders.length})</option>
              {Object.entries(statusCounts).map(([status, count]) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)} ({count})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Orders {filteredOrders.length !== orders.length && `(${filteredOrders.length} filtered)`}
          </h3>
          <span className="text-sm text-gray-500">{filteredOrders.length} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.slice(0, 50).map((order, idx) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 animate-slideUp" style={{ animationDelay: `${idx * 20}ms` }}>
                    <td className="px-6 py-4 text-sm font-bold text-purple-600 dark:text-purple-400">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{format(parseISO(order.date_created), "MMM dd, yyyy HH:mm")}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{order.billing.first_name} {order.billing.last_name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{order.billing.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.line_items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(parseFloat(order.total), currency)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 50 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing 50 of {filteredOrders.length} orders
          </div>
        )}
      </div>
    </div>
  );
}
