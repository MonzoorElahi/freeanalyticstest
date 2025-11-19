"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Trash2,
  Edit,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  RefreshCw,
  CreditCard,
  Building2,
  Target,
  PieChart,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from "date-fns";
import ExpenseByCategoryChart from "@/components/charts/ExpenseByCategoryChart";
import ExpensesTrendChart from "@/components/charts/ExpensesTrendChart";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import VendorAnalyticsChart from "@/components/charts/VendorAnalyticsChart";
import BudgetTrackingChart from "@/components/charts/BudgetTrackingChart";
import type { Expense, ExpenseCategory, ExpenseAnalytics, ExpenseFilter } from "@/types";

type TabType = "overview" | "expenses" | "analytics";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [monthlyBudget, setMonthlyBudget] = useState<number>(10000); // Default budget
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [vendorData, setVendorData] = useState<any[]>([]);
  const currency = "EUR";

  // Form state
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    category: "Other" as ExpenseCategory,
    description: "",
    source: "",
    vendor: "",
    paymentMethod: "",
    notes: "",
    recurring: false,
    recurringInterval: "monthly" as "monthly" | "quarterly" | "yearly",
  });

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/expenses");
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const result = await response.json();
      setExpenses(result.success ? result.data : result);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Calculate analytics
  useEffect(() => {
    if (expenses.length === 0) {
      setAnalytics(null);
      return;
    }

    // Filter expenses
    let filteredExpenses = expenses.filter((exp) => {
      if (filter.startDate && exp.date < filter.startDate) return false;
      if (filter.endDate && exp.date > filter.endDate) return false;
      if (filter.category && exp.category !== filter.category) return false;
      if (filter.source && exp.source !== filter.source) return false;
      if (filter.minAmount && exp.amount < filter.minAmount) return false;
      if (filter.maxAmount && exp.amount > filter.maxAmount) return false;
      if (filter.recurring !== undefined && exp.recurring !== filter.recurring) return false;
      if (filter.vendor && exp.vendor?.toLowerCase() !== filter.vendor.toLowerCase()) return false;
      if (searchTerm && !exp.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !exp.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // By category
    const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
    filteredExpenses.forEach((exp) => {
      const existing = categoryMap.get(exp.category) || { total: 0, count: 0 };
      categoryMap.set(exp.category, {
        total: existing.total + exp.amount,
        count: existing.count + 1,
      });
    });

    const expensesByCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: (data.total / totalExpenses) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    // By month
    const monthMap = new Map<string, { total: number; count: number }>();
    filteredExpenses.forEach((exp) => {
      const month = format(new Date(exp.date), "MMM yyyy");
      const existing = monthMap.get(month) || { total: 0, count: 0 };
      monthMap.set(month, {
        total: existing.total + exp.amount,
        count: existing.count + 1,
      });
    });

    const expensesByMonth = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // By source
    const sourceMap = new Map<string, { total: number; count: number }>();
    filteredExpenses.forEach((exp) => {
      if (exp.source) {
        const existing = sourceMap.get(exp.source) || { total: 0, count: 0 };
        sourceMap.set(exp.source, {
          total: existing.total + exp.amount,
          count: existing.count + 1,
        });
      }
    });

    const expensesBySource = Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    // Top expenses
    const topExpenses = [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Recurring expenses
    const recurringExpenses = filteredExpenses.filter((exp) => exp.recurring);
    const recurringTotal = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const intervalMap = new Map<string, { total: number; count: number }>();
    recurringExpenses.forEach((exp) => {
      const interval = exp.recurringInterval || "monthly";
      const existing = intervalMap.get(interval) || { total: 0, count: 0 };
      intervalMap.set(interval, {
        total: existing.total + exp.amount,
        count: existing.count + 1,
      });
    });

    // Trend calculation
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);

    const currentMonthExpenses = filteredExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth(currentMonth) && expDate <= endOfMonth(currentMonth);
    });

    const previousMonthExpenses = filteredExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth(previousMonth) && expDate <= endOfMonth(previousMonth);
    });

    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const previousTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const change = currentTotal - previousTotal;
    const percentageChange = previousTotal > 0 ? (change / previousTotal) * 100 : 0;

    // Payment method analytics
    const paymentMethodMap = new Map<string, { total: number; count: number }>();
    filteredExpenses.forEach((exp) => {
      const method = exp.paymentMethod || "Other";
      const existing = paymentMethodMap.get(method) || { total: 0, count: 0 };
      paymentMethodMap.set(method, {
        total: existing.total + exp.amount,
        count: existing.count + 1,
      });
    });

    const paymentMethods = Array.from(paymentMethodMap.entries())
      .map(([method, data]) => ({
        method,
        total: data.total,
        count: data.count,
        percentage: (data.total / totalExpenses) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    setPaymentMethodData(paymentMethods);

    // Vendor analytics
    const vendorMap = new Map<string, { total: number; count: number }>();
    filteredExpenses.forEach((exp) => {
      if (exp.vendor) {
        const existing = vendorMap.get(exp.vendor) || { total: 0, count: 0 };
        vendorMap.set(exp.vendor, {
          total: existing.total + exp.amount,
          count: existing.count + 1,
        });
      }
    });

    const vendors = Array.from(vendorMap.entries())
      .map(([vendor, data]) => ({
        vendor,
        total: data.total,
        count: data.count,
        avgTransaction: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total);

    setVendorData(vendors);

    setAnalytics({
      totalExpenses,
      expensesByCategory,
      expensesByMonth,
      expensesBySource,
      topExpenses,
      averageExpense: totalExpenses / filteredExpenses.length || 0,
      monthlyAverage: expensesByMonth.length > 0
        ? expensesByMonth.reduce((sum, m) => sum + m.total, 0) / expensesByMonth.length
        : 0,
      recurringExpenses: {
        total: recurringTotal,
        count: recurringExpenses.length,
        byInterval: Array.from(intervalMap.entries()).map(([interval, data]) => ({
          interval,
          total: data.total,
          count: data.count,
        })),
      },
      expenseTrend: {
        current: currentTotal,
        previous: previousTotal,
        change,
        percentageChange,
      },
    });
  }, [expenses, filter, searchTerm]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      const url = editingExpense ? `/api/expenses?id=${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) throw new Error("Failed to save expense");

      await fetchExpenses();
      setShowAddModal(false);
      setEditingExpense(null);
      resetForm();
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Failed to save expense");
    }
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete expense");
      await fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedExpenses.size === 0) return;
    if (!confirm(`Delete ${selectedExpenses.size} expenses?`)) return;

    try {
      await Promise.all(
        Array.from(selectedExpenses).map((id) =>
          fetch(`/api/expenses?id=${id}`, { method: "DELETE" })
        )
      );
      await fetchExpenses();
      setSelectedExpenses(new Set());
    } catch (err) {
      console.error("Error deleting expenses:", err);
      alert("Failed to delete some expenses");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    const headers = ["Date", "Category", "Description", "Amount", "Source", "Vendor", "Payment Method", "Recurring", "Notes"];
    const rows = expenses.map((exp) => [
      exp.date,
      exp.category,
      exp.description,
      exp.amount.toString(),
      exp.source || "",
      exp.vendor || "",
      exp.paymentMethod || "",
      exp.recurring ? "Yes" : "No",
      exp.notes || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

      const imports: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim());
        const expense: any = {};

        headers.forEach((header, index) => {
          const value = values[index];
          switch (header.toLowerCase()) {
            case "date":
              expense.date = value;
              break;
            case "category":
              expense.category = value;
              break;
            case "description":
              expense.description = value;
              break;
            case "amount":
              expense.amount = parseFloat(value);
              break;
            case "source":
              expense.source = value;
              break;
            case "vendor":
              expense.vendor = value;
              break;
            case "payment method":
              expense.paymentMethod = value;
              break;
            case "recurring":
              expense.recurring = value.toLowerCase() === "yes";
              break;
            case "notes":
              expense.notes = value;
              break;
          }
        });

        if (expense.date && expense.amount && expense.category && expense.description) {
          imports.push(expense);
        }
      }

      // Import all expenses
      try {
        await Promise.all(
          imports.map((exp) =>
            fetch("/api/expenses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(exp),
            })
          )
        );
        await fetchExpenses();
        alert(`Successfully imported ${imports.length} expenses`);
      } catch (err) {
        console.error("Error importing expenses:", err);
        alert("Failed to import some expenses");
      }
    };

    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "",
      category: "Other",
      description: "",
      source: "",
      vendor: "",
      paymentMethod: "",
      notes: "",
      recurring: false,
      recurringInterval: "monthly",
    });
  };

  const categories: ExpenseCategory[] = [
    "Marketing",
    "Advertising",
    "Shipping",
    "Software",
    "Operations",
    "Salaries",
    "Rent",
    "Utilities",
    "Other",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Receipt className="w-8 h-8" />
              Expense Management
            </h1>
            <p className="text-red-100">
              Track, analyze, and optimize your business expenses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingExpense(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>

            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              id="csv-import"
            />
            <label
              htmlFor="csv-import"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </label>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            <button
              onClick={fetchExpenses}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 backdrop-blur-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "overview" as TabType, label: "Overview", icon: BarChart3 },
          { id: "expenses" as TabType, label: "All Expenses", icon: FileText },
          { id: "analytics" as TabType, label: "Analytics", icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-red-600 text-red-600 dark:text-red-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-red-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.totalExpenses, currency)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Count</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(expenses.length)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Average Expense</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.averageExpense, currency)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {analytics.expenseTrend.change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.expenseTrend.current, currency)}
              </p>
              <p className={`text-xs mt-1 ${analytics.expenseTrend.change > 0 ? "text-red-600" : "text-green-600"}`}>
                {analytics.expenseTrend.change > 0 ? "+" : ""}
                {analytics.expenseTrend.percentageChange.toFixed(1)}% vs last month
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Expenses by Category
              </h3>
              <ExpenseByCategoryChart data={analytics.expensesByCategory} currency={currency} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Expense Trend
              </h3>
              <ExpensesTrendChart data={analytics.expensesByMonth} currency={currency} />
            </div>
          </div>

          {/* Top Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Largest Expenses
            </h3>
            <div className="space-y-3">
              {analytics.topExpenses.slice(0, 5).map((exp, idx) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {exp.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {exp.category} • {format(new Date(exp.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-red-600">
                    {formatCurrency(exp.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expenses List Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {selectedExpenses.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedExpenses.size})
              </button>
            )}
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.size === expenses.length && expenses.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExpenses(new Set(expenses.map((exp) => exp.id)));
                          } else {
                            setSelectedExpenses(new Set());
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.has(exp.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedExpenses);
                            if (e.target.checked) {
                              newSelected.add(exp.id);
                            } else {
                              newSelected.delete(exp.id);
                            }
                            setSelectedExpenses(newSelected);
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {format(new Date(exp.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {exp.description}
                          </p>
                          {exp.vendor && (
                            <p className="text-xs text-gray-500">{exp.vendor}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">
                        {formatCurrency(exp.amount, currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingExpense(exp);
                              setFormData({
                                date: exp.date,
                                amount: exp.amount.toString(),
                                category: exp.category,
                                description: exp.description,
                                source: exp.source || "",
                                vendor: exp.vendor || "",
                                paymentMethod: exp.paymentMethod || "",
                                notes: exp.notes || "",
                                recurring: exp.recurring || false,
                                recurringInterval: exp.recurringInterval || "monthly",
                              });
                              setShowAddModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          {/* Budget Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Monthly Budget Tracker
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Budget"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{currency}</span>
              </div>
            </div>
            <BudgetTrackingChart
              budget={monthlyBudget}
              spent={analytics.expenseTrend.current}
              currency={currency}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            {paymentMethodData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Method Breakdown
                </h3>
                <PaymentMethodChart data={paymentMethodData} currency={currency} />
              </div>
            )}

            {/* Recurring Expenses */}
            {analytics.recurringExpenses.count > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                  Recurring Expenses
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Total Recurring Expenses
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(analytics.recurringExpenses.total, currency)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {analytics.recurringExpenses.count} recurring expense{analytics.recurringExpenses.count !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      By Interval
                    </h4>
                    {analytics.recurringExpenses.byInterval.map((interval) => (
                      <div
                        key={interval.interval}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {interval.interval}
                          </p>
                          <p className="text-xs text-gray-500">{interval.count} expense{interval.count !== 1 ? "s" : ""}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(interval.total, currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Analytics */}
          {vendorData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Vendor Spending Analysis
              </h3>
              <VendorAnalyticsChart data={vendorData} currency={currency} />
            </div>
          )}

          {/* Expense Forecasting */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              3-Month Forecast
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((month) => {
                const forecastDate = addMonths(new Date(), month);
                const avgMonthlyExpense = analytics.monthlyAverage;
                const forecastAmount = avgMonthlyExpense * (1 + (analytics.expenseTrend.percentageChange / 100));

                return (
                  <div
                    key={month}
                    className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
                  >
                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                      {format(forecastDate, "MMM yyyy")}
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(forecastAmount, currency)}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Projected expense
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              📊 Forecast based on historical average and current trend ({analytics.expenseTrend.percentageChange >= 0 ? "+" : ""}{analytics.expenseTrend.percentageChange.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExpense(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount * (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vendor
                    </label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <input
                      type="text"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
                  >
                    {editingExpense ? "Update Expense" : "Add Expense"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingExpense(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
