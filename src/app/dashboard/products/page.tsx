"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, Package, TrendingUp, DollarSign, AlertTriangle, BarChart3, Tag, Eye, EyeOff, Star } from "lucide-react";
import { WooProduct } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { DashboardSkeleton } from "@/components/Skeleton";
import DoughnutChart from "@/components/charts/DoughnutChart";
import ProductSalesChart from "@/components/charts/ProductSalesChart";

export default function ProductsPage() {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"sales" | "price" | "stock" | "date">("sales");
  const [filterStock, setFilterStock] = useState<"all" | "instock" | "outofstock" | "lowstock">("all");
  const [currency, setCurrency] = useState("EUR");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, analyticsRes] = await Promise.all([
        fetch("/api/woocommerce/products"),
        fetch("/api/woocommerce/analytics?days=30"),
      ]);
      const productsData = await productsRes.json();
      const analyticsData = await analyticsRes.json();

      // Handle new standardized API response format
      const productsArray = productsData.success ? productsData.data.products : productsData.products || [];
      setProducts(productsArray);

      const currencyValue = analyticsData.success ? analyticsData.data.currency : analyticsData.currency;
      if (currencyValue) setCurrency(currencyValue);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStock = true;
      if (filterStock === "instock") matchesStock = product.stock_status === "instock";
      if (filterStock === "outofstock") matchesStock = product.stock_status === "outofstock";
      if (filterStock === "lowstock") matchesStock = product.stock_quantity !== null && product.stock_quantity > 0 && product.stock_quantity <= 10;

      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "sales") return b.total_sales - a.total_sales;
      if (sortBy === "price") return parseFloat(b.price || "0") - parseFloat(a.price || "0");
      if (sortBy === "stock") return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
    });

  // Calculate metrics
  const totalSales = products.reduce((sum, p) => sum + p.total_sales, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.total_sales * parseFloat(p.price || "0"), 0);
  const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0) / products.length : 0;
  const inStockCount = products.filter((p) => p.stock_status === "instock").length;
  const outOfStockCount = products.filter((p) => p.stock_status === "outofstock").length;
  const lowStockCount = products.filter((p) => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= 10).length;

  // Top products for chart
  const topProductsData = [...products]
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10)
    .map((p) => ({ name: p.name, sales: p.total_sales * parseFloat(p.price || "0"), quantity: p.total_sales }));

  // Category distribution
  const categoryStats: Record<string, number> = {};
  products.forEach((p) => {
    p.categories?.forEach((cat) => {
      categoryStats[cat.name] = (categoryStats[cat.name] || 0) + 1;
    });
  });
  const topCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const getStockStatus = (product: WooProduct) => {
    if (product.stock_status === "instock") {
      const isLow = product.stock_quantity !== null && product.stock_quantity <= 10;
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${isLow ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>
          {isLow && <AlertTriangle className="w-3 h-3" />}
          {isLow ? "Low Stock" : "In Stock"}
          {product.stock_quantity !== null && ` (${product.stock_quantity})`}
        </span>
      );
    }
    if (product.stock_status === "outofstock") {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Out of Stock
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
        On Backorder
      </span>
    );
  };

  if (loading && products.length === 0) return <DashboardSkeleton />;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-purple-600" />
            Product Performance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor inventory and product analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-600"}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded ${viewMode === "table" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-600"}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-all hover:shadow-lg active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-500">Total Products</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(products.length)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-500">Units Sold</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(totalSales)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500">Est. Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-500">Avg Price</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgPrice, currency)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-gray-500">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatNumber(lowStockCount)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-gray-500">Out of Stock</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatNumber(outOfStockCount)}</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stock Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Status</h3>
          <DoughnutChart
            labels={["In Stock", "Low Stock", "Out of Stock"]}
            data={[inStockCount - lowStockCount, lowStockCount, outOfStockCount]}
            title=""
          />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">In Stock</span>
              <span className="font-medium text-green-600">{inStockCount - lowStockCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-medium text-yellow-600">{lowStockCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-medium text-red-600">{outOfStockCount}</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => {
              const percentage = (count / products.length) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">{category}</span>
                    <span className="text-gray-600">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Best Sellers
          </h3>
          <div className="space-y-3">
            {[...products].sort((a, b) => b.total_sales - a.total_sales).slice(0, 5).map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-gray-100 text-gray-700" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-600"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                </div>
                <p className="text-sm font-bold text-purple-600">{product.total_sales} sold</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Chart */}
      {topProductsData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 10 Products by Revenue</h3>
          <ProductSalesChart data={topProductsData} metric="sales" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as "all" | "instock" | "outofstock" | "lowstock")}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock (≤10)</option>
            <option value="outofstock">Out of Stock</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "sales" | "price" | "stock" | "date")}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="sales">Sort by Sales</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 24).map((product, idx) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 animate-slideUp group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].src} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStockStatus(product)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[48px]">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(parseFloat(product.price || "0"), currency)}
                    </span>
                    {product.regular_price && product.sale_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(parseFloat(product.regular_price), currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
                    <span className="font-bold text-gray-900 dark:text-white">{product.total_sales} units</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(product.total_sales * parseFloat(product.price || "0"), currency)}</span>
                  </div>
                  {product.categories && product.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.categories.slice(0, 2).map((cat) => (
                        <span key={cat.id} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">No products found</div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.slice(0, 50).map((product, idx) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 animate-slideUp" style={{ animationDelay: `${idx * 20}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].src} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-purple-600">{formatCurrency(parseFloat(product.price || "0"), currency)}</td>
                    <td className="px-6 py-4">{getStockStatus(product)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{product.total_sales} units</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{formatCurrency(product.total_sales * parseFloat(product.price || "0"), currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProducts.length > (viewMode === "grid" ? 24 : 50) && (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {viewMode === "grid" ? 24 : 50} of {filteredProducts.length} products
        </div>
      )}
    </div>
  );
}
