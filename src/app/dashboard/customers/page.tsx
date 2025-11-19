"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, Users, UserPlus, Megaphone, TrendingUp, MapPin, DollarSign, ShoppingCart, Crown, Award, Sparkles } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { WooCustomer } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { DashboardSkeleton } from "@/components/Skeleton";
import CustomerChart from "@/components/charts/CustomerChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/EmptyState";
import MetricCard from "@/components/MetricCard";

export default function CustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<WooCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "spent" | "orders">("spent");
  const [currency, setCurrency] = useState("EUR");
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersRes, analyticsRes] = await Promise.all([
        fetch("/api/woocommerce/customers"),
        fetch("/api/woocommerce/analytics?days=30"),
      ]);

      if (!customersRes.ok) {
        throw new Error("Failed to load customers");
      }

      const customersData = await customersRes.json();
      const analyticsData = await analyticsRes.json();

      // Handle new standardized API response format
      const customersArray = customersData.success ? customersData.data.customers : customersData.customers || [];

      if (!Array.isArray(customersArray)) {
        throw new Error("Invalid customer data format");
      }

      setCustomers(customersArray);

      const currencyValue = analyticsData.success ? analyticsData.data.currency : analyticsData.currency;
      if (currencyValue) setCurrency(currencyValue);

      if (customersArray.length === 0) {
        showToast({
          type: "info",
          title: "No customers found",
          message: "Your store doesn't have any customers yet."
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch customers";
      setError(message);
      showToast({
        type: "error",
        title: "Error loading customers",
        message
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers
    .filter((customer) => {
      if (!customer || searchTerm === "") return true;

      const searchLower = searchTerm.toLowerCase();
      const email = (customer.email || "").toLowerCase();
      const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.toLowerCase();
      const username = (customer.username || "").toLowerCase();

      return email.includes(searchLower) || fullName.includes(searchLower) || username.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === "spent") {
        const aSpent = parseFloat(a.total_spent || "0");
        const bSpent = parseFloat(b.total_spent || "0");
        return bSpent - aSpent;
      }
      if (sortBy === "orders") {
        return (b.orders_count || 0) - (a.orders_count || 0);
      }
      const aDate = a.date_created ? new Date(a.date_created).getTime() : 0;
      const bDate = b.date_created ? new Date(b.date_created).getTime() : 0;
      return bDate - aDate;
    });

  // Calculate metrics with safe access
  const totalSpent = customers.reduce((sum, c) => sum + parseFloat(c.total_spent || "0"), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (c.orders_count || 0), 0);
  const avgSpent = customers.length > 0 ? totalSpent / customers.length : 0;
  const avgOrders = customers.length > 0 ? totalOrders / customers.length : 0;

  const thirtyDaysAgo = subDays(new Date(), 30);
  const newCustomersLast30Days = customers.filter((c) => {
    try {
      return c.date_created && parseISO(c.date_created) >= thirtyDaysAgo;
    } catch {
      return false;
    }
  }).length;

  // Top customers with safe sorting
  const topCustomers = [...customers]
    .sort((a, b) => {
      const aSpent = parseFloat(a.total_spent || "0");
      const bSpent = parseFloat(b.total_spent || "0");
      return bSpent - aSpent;
    })
    .slice(0, 5);

  // Customer segments with safe access
  const highValue = customers.filter((c) => parseFloat(c.total_spent || "0") > 500).length;
  const mediumValue = customers.filter((c) => {
    const spent = parseFloat(c.total_spent || "0");
    return spent > 100 && spent <= 500;
  }).length;
  const lowValue = customers.filter((c) => {
    const spent = parseFloat(c.total_spent || "0");
    return spent <= 100 && spent > 0;
  }).length;
  const noOrders = customers.filter((c) => (c.orders_count || 0) === 0).length;

  // Customers by country with safe access
  const countryStats: Record<string, number> = {};
  customers.forEach((c) => {
    if (c.billing?.country) {
      const country = c.billing.country;
      countryStats[country] = (countryStats[country] || 0) + 1;
    }
  });
  const topCountries = Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Chart data with safe date parsing
  const customersByDate: Record<string, number> = {};
  customers
    .filter((c) => {
      try {
        return c.date_created && parseISO(c.date_created) >= thirtyDaysAgo;
      } catch {
        return false;
      }
    })
    .forEach((customer) => {
      try {
        const date = format(parseISO(customer.date_created), "yyyy-MM-dd");
        customersByDate[date] = (customersByDate[date] || 0) + 1;
      } catch {
        // Skip invalid dates
      }
    });
  const chartData = Object.entries(customersByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading && customers.length === 0) return <DashboardSkeleton />;

  // Show error state if there's an error
  if (error && customers.length === 0) {
    return (
      <div className="page-transition">
        <EmptyState
          icon={Users}
          title="Failed to load customers"
          description={error}
          actionLabel="Try Again"
          onAction={fetchCustomers}
        />
      </div>
    );
  }

  return (
    <div className="page-transition space-y-8">
      {/* Header with Gradient */}
      <div className="glass-strong p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-slide-in-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 gradient-primary rounded-xl shadow-lg animate-float">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">
                Customer Analytics
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-base font-medium">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Analyze your customer base and lifetime value
            </p>
          </div>
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="btn-primary flex items-center gap-2 animate-slide-in-right"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="divider-gradient" />

      {/* Quick Stats using MetricCard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <MetricCard
          title="Total Customers"
          value={customers.length}
          icon={Users}
          iconColor="text-purple-600 dark:text-purple-400"
          animated={true}
        />
        <MetricCard
          title="New (30 Days)"
          value={newCustomersLast30Days}
          icon={UserPlus}
          iconColor="text-green-600 dark:text-green-400"
          animated={true}
        />
        <MetricCard
          title="Total Revenue"
          value={totalSpent}
          icon={DollarSign}
          iconColor="text-blue-600 dark:text-blue-400"
          valuePrefix={currency === "EUR" ? "€" : "$"}
          animated={true}
          decimals={2}
        />
        <MetricCard
          title="Avg LTV"
          value={avgSpent}
          icon={TrendingUp}
          iconColor="text-orange-600 dark:text-orange-400"
          valuePrefix={currency === "EUR" ? "€" : "$"}
          animated={true}
          decimals={2}
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          iconColor="text-indigo-600 dark:text-indigo-400"
          animated={true}
        />
        <MetricCard
          title="High Value"
          value={highValue}
          icon={Crown}
          iconColor="text-yellow-600 dark:text-yellow-400"
          animated={true}
        />
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
          <div className="space-y-3">
            {topCustomers.length > 0 ? topCustomers.map((customer, idx) => {
              const firstName = customer.first_name || "";
              const lastName = customer.last_name || "";
              const fullName = `${firstName} ${lastName}`.trim() || "No Name";
              const spent = parseFloat(customer.total_spent || "0");
              const orders = customer.orders_count || 0;

              return (
                <div key={customer.id} className="interactive-card flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                    idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white" :
                    idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white" :
                    idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                    "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300"
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{orders} orders</p>
                  </div>
                  <p className="text-sm font-bold text-gradient whitespace-nowrap">{formatCurrency(spent, currency)}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-500 text-center py-4">No customer data available</p>
            )}
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
                filteredCustomers.slice(0, 50).map((customer, idx) => {
                  const firstName = customer.first_name || "";
                  const lastName = customer.last_name || "";
                  const fullName = `${firstName} ${lastName}`.trim() || "No Name";
                  const spent = parseFloat(customer.total_spent || "0");
                  const orders = customer.orders_count || 0;
                  const avgOrder = orders > 0 ? spent / orders : 0;

                  return (
                    <tr key={customer.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 smooth-fast animate-fadeIn" style={{ animationDelay: `${Math.min(idx * 20, 500)}ms` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url}
                              alt={fullName}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.fallback-avatar')) {
                                  const div = document.createElement('div');
                                  div.className = 'fallback-avatar w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm';
                                  div.textContent = (firstName.charAt(0) || lastName.charAt(0) || '?').toUpperCase();
                                  parent.appendChild(div);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {(firstName.charAt(0) || lastName.charAt(0) || '?').toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{customer.email || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {customer.date_created ? (
                          (() => {
                            try {
                              return format(parseISO(customer.date_created), "MMM dd, yyyy");
                            } catch {
                              return "—";
                            }
                          })()
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{orders}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gradient">{formatCurrency(spent, currency)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {avgOrder > 0 ? formatCurrency(avgOrder, currency) : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {customer.billing?.city && customer.billing?.country
                          ? `${customer.billing.city}, ${customer.billing.country}`
                          : customer.billing?.country || "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <EmptyState
                      icon={Search}
                      title="No customers found"
                      description="Try adjusting your search or filters"
                    />
                  </td>
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
