"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, Users, UserPlus, Megaphone, TrendingUp, MapPin, DollarSign, ShoppingCart, Crown, Award } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { WooCustomer } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { DashboardSkeleton } from "@/components/Skeleton";
import CustomerChart from "@/components/charts/CustomerChart";
import DoughnutChart from "@/components/charts/DoughnutChart";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<WooCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "spent" | "orders">("spent");
  const [currency, setCurrency] = useState("EUR");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const [customersRes, analyticsRes] = await Promise.all([
        fetch("/api/woocommerce/customers"),
        fetch("/api/woocommerce/analytics?days=30"),
      ]);
      const customersData = await customersRes.json();
      const analyticsData = await analyticsRes.json();

      // Handle new standardized API response format
      const customersArray = customersData.success ? customersData.data.customers : customersData.customers || [];
      setCustomers(customersArray);

      const currencyValue = analyticsData.success ? analyticsData.data.currency : analyticsData.currency;
      if (currencyValue) setCurrency(currencyValue);
    } catch {
      console.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers
    .filter((customer) => {
      return (
        searchTerm === "" ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "spent") return parseFloat(b.total_spent) - parseFloat(a.total_spent);
      if (sortBy === "orders") return b.orders_count - a.orders_count;
      return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
    });

  // Calculate metrics
  const totalSpent = customers.reduce((sum, c) => sum + parseFloat(c.total_spent), 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orders_count, 0);
  const avgSpent = customers.length > 0 ? totalSpent / customers.length : 0;
  const avgOrders = customers.length > 0 ? totalOrders / customers.length : 0;

  const thirtyDaysAgo = subDays(new Date(), 30);
  const newCustomersLast30Days = customers.filter((c) => parseISO(c.date_created) >= thirtyDaysAgo).length;

  // Top customers
  const topCustomers = [...customers].sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent)).slice(0, 5);

  // Customer segments
  const highValue = customers.filter((c) => parseFloat(c.total_spent) > 500).length;
  const mediumValue = customers.filter((c) => parseFloat(c.total_spent) > 100 && parseFloat(c.total_spent) <= 500).length;
  const lowValue = customers.filter((c) => parseFloat(c.total_spent) <= 100 && parseFloat(c.total_spent) > 0).length;
  const noOrders = customers.filter((c) => c.orders_count === 0).length;

  // Customers by country
  const countryStats: Record<string, number> = {};
  customers.forEach((c) => {
    if (c.billing.country) {
      countryStats[c.billing.country] = (countryStats[c.billing.country] || 0) + 1;
    }
  });
  const topCountries = Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Chart data
  const customersByDate: Record<string, number> = {};
  customers.filter((c) => parseISO(c.date_created) >= thirtyDaysAgo).forEach((customer) => {
    const date = format(parseISO(customer.date_created), "yyyy-MM-dd");
    customersByDate[date] = (customersByDate[date] || 0) + 1;
  });
  const chartData = Object.entries(customersByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  if (loading && customers.length === 0) return <DashboardSkeleton />;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Customer Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analyze your customer base and lifetime value</p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-all hover:shadow-lg active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-500">Total Customers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(customers.length)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-500">New (30 days)</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatNumber(newCustomersLast30Days)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-500">Avg LTV</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgSpent, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-500">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(totalOrders)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-gray-500">High Value</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatNumber(highValue)}</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Customer Segments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Segments</h3>
          <DoughnutChart
            labels={["High Value (>€500)", "Medium (€100-500)", "Low (<€100)", "No Orders"]}
            data={[highValue, mediumValue, lowValue, noOrders]}
            title=""
          />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">High Value</span>
              <span className="font-medium text-yellow-600">{highValue} ({((highValue / customers.length) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Medium Value</span>
              <span className="font-medium text-blue-600">{mediumValue} ({((mediumValue / customers.length) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Low Value</span>
              <span className="font-medium text-green-600">{lowValue} ({((lowValue / customers.length) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Customers
          </h3>
          <div className="space-y-4">
            {topCustomers.map((customer, idx) => (
              <div key={customer.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-gray-100 text-gray-700" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-600"
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{customer.first_name} {customer.last_name}</p>
                  <p className="text-xs text-gray-500">{customer.orders_count} orders</p>
                </div>
                <p className="text-sm font-bold text-purple-600">{formatCurrency(parseFloat(customer.total_spent), currency)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* By Country */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            By Country
          </h3>
          <div className="space-y-3">
            {topCountries.map(([country, count]) => {
              const percentage = (count / customers.length) * 100;
              return (
                <div key={country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{country}</span>
                    <span className="text-gray-600">{count} customers</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Customers Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Customer Acquisition (Last 30 Days)</h3>
          <CustomerChart data={chartData} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "spent" | "orders")}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="spent">Sort by Total Spent</option>
            <option value="orders">Sort by Orders</option>
            <option value="date">Sort by Registration Date</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Customers ({filteredCustomers.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.slice(0, 50).map((customer, idx) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 animate-slideUp" style={{ animationDelay: `${idx * 20}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={customer.avatar_url} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                        <span className="font-medium text-gray-900 dark:text-white">{customer.first_name} {customer.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{format(parseISO(customer.date_created), "MMM dd, yyyy")}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{customer.orders_count}</td>
                    <td className="px-6 py-4 text-sm font-bold text-purple-600">{formatCurrency(parseFloat(customer.total_spent), currency)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {customer.orders_count > 0 ? formatCurrency(parseFloat(customer.total_spent) / customer.orders_count, currency) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {customer.billing.city && customer.billing.country ? `${customer.billing.city}, ${customer.billing.country}` : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length > 50 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-600">
            Showing 50 of {filteredCustomers.length} customers
          </div>
        )}
      </div>
    </div>
  );
}
