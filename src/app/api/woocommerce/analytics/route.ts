import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createWooClient, fetchOrders, fetchCustomers, fetchProducts } from "@/lib/woocommerce";
import { WooOrder, WooCustomer, SalesData, CustomerData, DashboardMetrics } from "@/types";
import { subDays, subYears, format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { analyzeFrequentlyBoughtTogether, segmentCustomers, forecastRevenue } from "@/lib/analytics";
import { analyticsCache, getCacheKey, withCache } from "@/lib/cache";

// WooCommerce counts these statuses for orders (not pending, not failed)
const VALID_ORDER_STATUSES = ["completed", "processing", "on-hold"];

// WooCommerce calculates net sales from these statuses only
const NET_SALES_STATUSES = ["completed", "processing", "on-hold"];

interface ExtendedSalesData extends SalesData {
  grossSales: number;
  netSales: number;
  totalRefunds: number;
  totalShipping: number;
  totalTax: number;
  totalDiscount: number;
  itemsSold: number;
  avgItemsPerOrder: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; gross: number; net: number; orders: number; items: number }[];
  salesByCategory: { category: string; total: number; quantity: number }[];
  salesByCountry: { country: string; total: number; orders: number }[];
  salesByPaymentMethod: { method: string; total: number; count: number }[];
  hourlyDistribution: { hour: number; orders: number; revenue: number }[];
}

interface ExtendedCustomerData extends CustomerData {
  returningCustomers: number;
  guestOrders: number;
  avgOrdersPerCustomer: number;
  avgCustomerLifetimeValue: number;
  customersByCountry: { country: string; count: number }[];
  newVsReturning: { type: string; count: number; revenue: number }[];
  adsAttribution: {
    source: string;
    count: number;
    revenue: number;
  }[];
}

function getOrderNetTotal(order: WooOrder): number {
  // Net total = total - refunds
  const total = parseFloat(order.total);
  const refundTotal = order.refunds?.reduce((sum, r) => sum + Math.abs(parseFloat(r.total)), 0) || 0;
  return total - refundTotal;
}

function calculateExtendedSalesAnalytics(
  orders: WooOrder[],
  startDate: Date,
  endDate: Date
): ExtendedSalesData {
  // Filter orders by date
  const periodOrders = orders.filter((order) => {
    const orderDate = parseISO(order.date_created);
    return (
      isAfter(orderDate, startOfDay(startDate)) &&
      isBefore(orderDate, endOfDay(endDate))
    );
  });

  // Valid orders (exclude cancelled, refunded, failed, trash)
  const validOrders = periodOrders.filter((order) =>
    VALID_ORDER_STATUSES.includes(order.status)
  );

  // Net sales orders (for revenue calculation)
  const netSalesOrders = periodOrders.filter((order) =>
    NET_SALES_STATUSES.includes(order.status)
  );

  // Calculate totals
  let grossSales = 0;
  let netSales = 0;
  let totalRefunds = 0;
  let totalShipping = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  let itemsSold = 0;

  netSalesOrders.forEach((order) => {
    const orderTotal = parseFloat(order.total);
    const orderNet = getOrderNetTotal(order);
    const shipping = parseFloat(order.shipping_total || "0");
    const tax = parseFloat(order.total_tax || "0");
    const discount = parseFloat(order.discount_total || "0");
    const refunds = order.refunds?.reduce((sum, r) => sum + Math.abs(parseFloat(r.total)), 0) || 0;

    grossSales += orderTotal;
    netSales += orderNet;
    totalRefunds += refunds;
    totalShipping += shipping;
    totalTax += tax;
    totalDiscount += discount;

    order.line_items.forEach((item) => {
      itemsSold += item.quantity;
    });
  });

  const totalOrders = validOrders.length;
  const averageOrderValue = totalOrders > 0 ? netSales / totalOrders : 0;
  const avgItemsPerOrder = totalOrders > 0 ? itemsSold / totalOrders : 0;

  // Orders by status
  const ordersByStatus: Record<string, number> = {};
  periodOrders.forEach((order) => {
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
  });

  // Revenue by day
  const revenueByDayMap = new Map<string, { gross: number; net: number; orders: number; items: number }>();
  netSalesOrders.forEach((order) => {
    const date = format(parseISO(order.date_created), "yyyy-MM-dd");
    const existing = revenueByDayMap.get(date) || { gross: 0, net: 0, orders: 0, items: 0 };
    const itemCount = order.line_items.reduce((sum, item) => sum + item.quantity, 0);
    revenueByDayMap.set(date, {
      gross: existing.gross + parseFloat(order.total),
      net: existing.net + getOrderNetTotal(order),
      orders: existing.orders + 1,
      items: existing.items + itemCount,
    });
  });

  const revenueByDay = Array.from(revenueByDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Sales by product
  const salesByProductMap = new Map<number, { name: string; total: number; quantity: number }>();
  netSalesOrders.forEach((order) => {
    order.line_items.forEach((item) => {
      const existing = salesByProductMap.get(item.product_id) || {
        name: item.name,
        total: 0,
        quantity: 0,
      };
      salesByProductMap.set(item.product_id, {
        name: item.name,
        total: existing.total + parseFloat(item.total),
        quantity: existing.quantity + item.quantity,
      });
    });
  });

  const salesByProduct = Array.from(salesByProductMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.total - a.total);

  const topProducts = salesByProduct.slice(0, 10).map((p) => ({
    name: p.name,
    sales: p.total,
    quantity: p.quantity,
  }));

  // Sales by category
  const salesByCategoryMap = new Map<string, { total: number; quantity: number }>();
  netSalesOrders.forEach((order) => {
    order.line_items.forEach((item) => {
      const category = item.meta_data?.find((m) => m.key === "_category")?.value || "Uncategorized";
      const existing = salesByCategoryMap.get(category as string) || { total: 0, quantity: 0 };
      salesByCategoryMap.set(category as string, {
        total: existing.total + parseFloat(item.total),
        quantity: existing.quantity + item.quantity,
      });
    });
  });

  const salesByCategory = Array.from(salesByCategoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);

  // Sales by country
  const salesByCountryMap = new Map<string, { total: number; orders: number }>();
  netSalesOrders.forEach((order) => {
    const country = order.billing.country || "Unknown";
    const existing = salesByCountryMap.get(country) || { total: 0, orders: 0 };
    salesByCountryMap.set(country, {
      total: existing.total + getOrderNetTotal(order),
      orders: existing.orders + 1,
    });
  });

  const salesByCountry = Array.from(salesByCountryMap.entries())
    .map(([country, data]) => ({ country, ...data }))
    .sort((a, b) => b.total - a.total);

  // Sales by payment method
  const salesByPaymentMap = new Map<string, { total: number; count: number }>();
  netSalesOrders.forEach((order) => {
    const method = order.payment_method_title || "Unknown";
    const existing = salesByPaymentMap.get(method) || { total: 0, count: 0 };
    salesByPaymentMap.set(method, {
      total: existing.total + getOrderNetTotal(order),
      count: existing.count + 1,
    });
  });

  const salesByPaymentMethod = Array.from(salesByPaymentMap.entries())
    .map(([method, data]) => ({ method, ...data }))
    .sort((a, b) => b.total - a.total);

  // Hourly distribution
  const hourlyMap = new Map<number, { orders: number; revenue: number }>();
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, { orders: 0, revenue: 0 });
  }
  netSalesOrders.forEach((order) => {
    const hour = parseISO(order.date_created).getHours();
    const existing = hourlyMap.get(hour)!;
    hourlyMap.set(hour, {
      orders: existing.orders + 1,
      revenue: existing.revenue + getOrderNetTotal(order),
    });
  });

  const hourlyDistribution = Array.from(hourlyMap.entries())
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour - b.hour);

  // Legacy format compatibility
  const salesByDate = revenueByDay.map((d) => ({
    date: d.date,
    total: d.net,
    orders: d.orders,
  }));

  return {
    grossSales,
    netSales,
    totalSales: netSales,
    totalOrders,
    averageOrderValue,
    totalRefunds,
    totalShipping,
    totalTax,
    totalDiscount,
    itemsSold,
    avgItemsPerOrder,
    ordersByStatus,
    revenueByDay,
    salesByDate,
    salesByProduct,
    topProducts,
    salesByCategory,
    salesByCountry,
    salesByPaymentMethod,
    hourlyDistribution,
  };
}

function calculateExtendedCustomerAnalytics(
  customers: WooCustomer[],
  orders: WooOrder[],
  startDate: Date,
  endDate: Date
): ExtendedCustomerData {
  const periodOrders = orders.filter((order) => {
    const orderDate = parseISO(order.date_created);
    return (
      isAfter(orderDate, startOfDay(startDate)) &&
      isBefore(orderDate, endOfDay(endDate)) &&
      VALID_ORDER_STATUSES.includes(order.status)
    );
  });

  // New customers: customers whose FIRST order is in this period
  const customerFirstOrderMap = new Map<number, Date>();
  orders
    .filter((o) => VALID_ORDER_STATUSES.includes(o.status) && o.customer_id > 0)
    .sort((a, b) => parseISO(a.date_created).getTime() - parseISO(b.date_created).getTime())
    .forEach((order) => {
      if (!customerFirstOrderMap.has(order.customer_id)) {
        customerFirstOrderMap.set(order.customer_id, parseISO(order.date_created));
      }
    });

  const newCustomerIds = new Set<number>();
  const returningCustomerIds = new Set<number>();

  periodOrders.forEach((order) => {
    if (order.customer_id > 0) {
      const firstOrderDate = customerFirstOrderMap.get(order.customer_id);
      if (
        firstOrderDate &&
        isAfter(firstOrderDate, startOfDay(startDate)) &&
        isBefore(firstOrderDate, endOfDay(endDate))
      ) {
        newCustomerIds.add(order.customer_id);
      } else if (firstOrderDate) {
        returningCustomerIds.add(order.customer_id);
      }
    }
  });

  const newCustomersCount = newCustomerIds.size;
  const returningCustomersCount = returningCustomerIds.size;

  // Guest orders
  const guestOrders = periodOrders.filter((o) => o.customer_id === 0).length;

  // Ads attribution - check WooCommerce order attribution meta
  const adsAttributionMap = new Map<string, { count: number; revenue: number }>();

  periodOrders.forEach((order) => {
    let source = "Direct / Organic";
    let isFromAds = false;

    // Check for WooCommerce Order Attribution
    const attributionData = order.meta_data?.find(
      (m) => m.key === "_wc_order_attribution_source_type" || m.key === "_wc_order_attribution_utm_source"
    );

    const utmSource = order.meta_data?.find((m) => m.key === "_wc_order_attribution_utm_source");
    const utmMedium = order.meta_data?.find((m) => m.key === "_wc_order_attribution_utm_medium");
    const sourceType = order.meta_data?.find((m) => m.key === "_wc_order_attribution_source_type");

    if (sourceType?.value === "utm") {
      const medium = utmMedium?.value?.toString().toLowerCase() || "";
      const src = utmSource?.value?.toString().toLowerCase() || "";

      if (medium.includes("cpc") || medium.includes("paid") || medium.includes("ppc")) {
        isFromAds = true;
        if (src.includes("google")) {
          source = "Google Ads";
        } else if (src.includes("facebook") || src.includes("fb")) {
          source = "Facebook Ads";
        } else if (src.includes("instagram")) {
          source = "Instagram Ads";
        } else if (src.includes("bing")) {
          source = "Bing Ads";
        } else {
          source = "Paid Ads";
        }
      } else if (medium.includes("social")) {
        source = "Social Media";
      } else if (medium.includes("email")) {
        source = "Email Marketing";
      } else if (medium.includes("referral")) {
        source = "Referral";
      } else {
        source = "UTM Campaign";
      }
    } else if (sourceType?.value === "organic") {
      source = "Organic Search";
    } else if (sourceType?.value === "referral") {
      source = "Referral";
    } else if (sourceType?.value === "direct") {
      source = "Direct";
    }

    // Also check for gclid/fbclid
    const hasGclid = order.meta_data?.some((m) => m.key.includes("gclid"));
    const hasFbclid = order.meta_data?.some((m) => m.key.includes("fbclid"));

    if (hasGclid && !isFromAds) {
      source = "Google Ads";
      isFromAds = true;
    } else if (hasFbclid && !isFromAds) {
      source = "Facebook Ads";
      isFromAds = true;
    }

    const existing = adsAttributionMap.get(source) || { count: 0, revenue: 0 };
    adsAttributionMap.set(source, {
      count: existing.count + 1,
      revenue: existing.revenue + getOrderNetTotal(order),
    });
  });

  const adsAttribution = Array.from(adsAttributionMap.entries())
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const newCustomersFromAds = adsAttribution
    .filter((a) => a.source.includes("Ads"))
    .reduce((sum, a) => sum + a.count, 0);

  // New vs Returning revenue
  let newCustomerRevenue = 0;
  let returningCustomerRevenue = 0;

  periodOrders.forEach((order) => {
    if (newCustomerIds.has(order.customer_id)) {
      newCustomerRevenue += getOrderNetTotal(order);
    } else if (returningCustomerIds.has(order.customer_id)) {
      returningCustomerRevenue += getOrderNetTotal(order);
    }
  });

  const newVsReturning = [
    { type: "New Customers", count: newCustomersCount, revenue: newCustomerRevenue },
    { type: "Returning Customers", count: returningCustomersCount, revenue: returningCustomerRevenue },
  ];

  // Customers by date (when they made first order)
  const customersByDateMap = new Map<string, number>();
  newCustomerIds.forEach((customerId) => {
    const firstOrder = orders.find((o) => o.customer_id === customerId);
    if (firstOrder) {
      const date = format(parseISO(firstOrder.date_created), "yyyy-MM-dd");
      customersByDateMap.set(date, (customersByDateMap.get(date) || 0) + 1);
    }
  });

  const customersByDate = Array.from(customersByDateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top customers
  const topCustomers = customers
    .filter((c) => c.orders_count > 0)
    .sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent))
    .slice(0, 10)
    .map((c) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`.trim() || c.email,
      totalSpent: parseFloat(c.total_spent),
      ordersCount: c.orders_count,
    }));

  // Customer retention
  const customersWithMultipleOrders = customers.filter((c) => c.orders_count > 1).length;
  const customerRetention =
    customers.length > 0 ? (customersWithMultipleOrders / customers.length) * 100 : 0;

  // Average orders per customer
  const activeCustomers = newCustomersCount + returningCustomersCount;
  const avgOrdersPerCustomer = activeCustomers > 0 ? periodOrders.length / activeCustomers : 0;

  // Average LTV
  const avgCustomerLifetimeValue =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + parseFloat(c.total_spent), 0) / customers.length
      : 0;

  // Customers by country
  const customersByCountryMap = new Map<string, number>();
  customers.forEach((customer) => {
    const country = customer.billing.country || "Unknown";
    customersByCountryMap.set(country, (customersByCountryMap.get(country) || 0) + 1);
  });

  const customersByCountry = Array.from(customersByCountryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCustomers: customers.length,
    newCustomers: newCustomersCount,
    returningCustomers: returningCustomersCount,
    newCustomersFromAds,
    customersByDate,
    customerRetention,
    topCustomers,
    guestOrders,
    avgOrdersPerCustomer,
    avgCustomerLifetimeValue,
    customersByCountry,
    newVsReturning,
    adsAttribution,
  };
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.credentials) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const compareType = searchParams.get("compare") || "previous"; // "previous" or "year"

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    let compareStartDate: Date;
    let compareEndDate: Date;

    if (compareType === "year") {
      // Compare to same period last year
      compareStartDate = subYears(startDate, 1);
      compareEndDate = subYears(endDate, 1);
    } else {
      // Compare to previous period
      compareStartDate = subDays(startDate, days);
      compareEndDate = startDate;
    }

    const client = createWooClient(session.credentials);

    // Fetch all data - need to go back far enough for comparison
    const fetchStartDate = compareType === "year" ? subYears(startDate, 1) : subDays(startDate, days);

    const [orders, customers, products] = await Promise.all([
      fetchOrders(client, {
        after: format(fetchStartDate, "yyyy-MM-dd'T'HH:mm:ss"),
      }),
      fetchCustomers(client),
      fetchProducts(client),
    ]);

    // Get currency from first order (default to EUR)
    const currency = orders.length > 0 ? orders[0].currency : "EUR";

    // Current period analytics
    const salesData = calculateExtendedSalesAnalytics(orders, startDate, endDate);
    const customerData = calculateExtendedCustomerAnalytics(customers, orders, startDate, endDate);

    // Comparison period analytics
    const compareSalesData = calculateExtendedSalesAnalytics(orders, compareStartDate, compareEndDate);
    const compareCustomerData = calculateExtendedCustomerAnalytics(
      customers,
      orders,
      compareStartDate,
      compareEndDate
    );

    // Dashboard metrics with growth
    const metrics: DashboardMetrics = {
      totalRevenue: salesData.netSales,
      totalOrders: salesData.totalOrders,
      totalCustomers: customerData.totalCustomers,
      averageOrderValue: salesData.averageOrderValue,
      conversionRate:
        customerData.totalCustomers > 0
          ? (salesData.totalOrders / customerData.totalCustomers) * 100
          : 0,
      revenueGrowth: calculateGrowth(salesData.netSales, compareSalesData.netSales),
      ordersGrowth: calculateGrowth(salesData.totalOrders, compareSalesData.totalOrders),
      customersGrowth: calculateGrowth(customerData.newCustomers, compareCustomerData.newCustomers),
    };

    // Advanced analytics
    const frequentlyBoughtTogether = analyzeFrequentlyBoughtTogether(orders, 2).slice(0, 10);
    const customerSegments = segmentCustomers(orders);
    const revenueForecast = forecastRevenue(
      salesData.revenueByDay.map((d) => ({ date: d.date, revenue: d.net })),
      7
    );

    return NextResponse.json({
      metrics,
      salesData,
      customerData,
      compareSalesData,
      compareCustomerData,
      products: products.slice(0, 100),
      currency,
      dateRange: {
        start: format(startDate, "yyyy-MM-dd"),
        end: format(endDate, "yyyy-MM-dd"),
        days,
        compareStart: format(compareStartDate, "yyyy-MM-dd"),
        compareEnd: format(compareEndDate, "yyyy-MM-dd"),
        compareType,
      },
      // Advanced analytics
      frequentlyBoughtTogether,
      customerSegments,
      revenueForecast,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
