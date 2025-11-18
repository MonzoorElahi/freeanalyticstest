/**
 * Comprehensive Analytics Type Definitions
 * Centralized type system for better type safety and reusability
 */

// ============================================================================
// Base Analytics Types
// ============================================================================

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface RevenueByDay {
  date: string;
  gross: number;
  net: number;
  orders: number;
  items: number;
}

export interface SalesByDate {
  date: string;
  total: number;
  orders: number;
}

export interface ProductSalesData {
  productId: number;
  name: string;
  total: number;
  quantity: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  quantity: number;
}

export interface SalesByCategory {
  category: string;
  total: number;
  quantity: number;
}

export interface SalesByCountry {
  country: string;
  total: number;
  orders: number;
}

export interface SalesByPaymentMethod {
  method: string;
  total: number;
  count: number;
}

export interface HourlyDistribution {
  hour: number;
  orders: number;
  revenue: number;
}

export interface ProductVelocity {
  productId: number;
  name: string;
  totalSales: number;
  avgDailySales: number;
  trend: "increasing" | "decreasing" | "stable";
  daysToSellOut: number | null;
}

// ============================================================================
// Customer Analytics Types
// ============================================================================

export interface CustomersByDate {
  date: string;
  count: number;
}

export interface TopCustomer {
  id: number;
  name: string;
  totalSpent: number;
  ordersCount: number;
}

export interface CustomersByCountry {
  country: string;
  count: number;
}

export interface NewVsReturning {
  type: string;
  count: number;
  revenue: number;
}

export interface AdsAttribution {
  source: string;
  count: number;
  revenue: number;
}

export interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  newCustomersFromAds: number;
  customersByDate: CustomersByDate[];
  customerRetention: number;
  topCustomers: TopCustomer[];
  guestOrders: number;
  avgOrdersPerCustomer: number;
  avgCustomerLifetimeValue: number;
  customersByCountry: CustomersByCountry[];
  newVsReturning: NewVsReturning[];
  adsAttribution: AdsAttribution[];
}

// ============================================================================
// Sales Data Types
// ============================================================================

export interface SalesData {
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
  revenueByDay: RevenueByDay[];
  salesByDate: SalesByDate[];
  salesByProduct: ProductSalesData[];
  topProducts: TopProduct[];
  salesByCategory: SalesByCategory[];
  salesByCountry: SalesByCountry[];
  salesByPaymentMethod: SalesByPaymentMethod[];
  hourlyDistribution: HourlyDistribution[];
}

// ============================================================================
// Advanced Analytics Types
// ============================================================================

export interface FrequentlyBoughtTogether {
  product1: { id: number; name: string };
  product2: { id: number; name: string };
  frequency: number;
  confidence: number;
  lift: number;
}

export interface CustomerSegment {
  segment: string;
  description: string;
  count: number;
  revenue: number;
  avgOrderValue: number;
  color: string;
}

export interface RevenueForecast {
  date: string;
  projectedRevenue: number;
  lowerBound: number;
  upperBound: number;
}

// ============================================================================
// Date Range Types
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
  days: number;
  compareStart: string;
  compareEnd: string;
  compareType: "previous" | "year";
}

// ============================================================================
// Complete Analytics Response
// ============================================================================

export interface AnalyticsResponse {
  metrics: AnalyticsMetrics;
  salesData: SalesData;
  customerData: CustomerData;
  compareSalesData: {
    netSales: number;
    totalOrders: number;
    revenueByDay?: RevenueByDay[];
  };
  compareCustomerData: {
    newCustomers: number;
  };
  currency: string;
  dateRange: DateRange;
  productVelocity?: ProductVelocity[];
  frequentlyBoughtTogether?: FrequentlyBoughtTogether[];
  customerSegments?: CustomerSegment[];
  revenueForecast?: RevenueForecast[];
}

// ============================================================================
// Chart Component Props
// ============================================================================

export interface BaseChartProps {
  loading?: boolean;
  error?: string | null;
  currency?: string;
}

export interface LineChartDataPoint {
  date: string;
  value: number;
}

export interface ComparisonDataPoint {
  date: string;
  current: number;
  previous: number;
}
