// WooCommerce Credentials
export interface WooCredentials {
  url: string;
  key: string;
  secret: string;
}

// Session Data
export interface SessionData {
  isLoggedIn: boolean;
  credentials?: WooCredentials;
}

// WooCommerce Types
export interface WooOrder {
  id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  total: string;
  subtotal: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
  };
  line_items: WooLineItem[];
  payment_method_title: string;
  meta_data: WooMetaData[];
  refunds?: WooRefund[];
}

export interface WooRefund {
  id: number;
  total: string;
  reason: string;
}

export interface WooLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  sku: string;
  meta_data?: WooMetaData[];
}

export interface WooMetaData {
  id: number;
  key: string;
  value: string;
}

export interface WooCustomer {
  id: number;
  date_created: string;
  date_modified: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: {
    city: string;
    state: string;
    country: string;
  };
  orders_count: number;
  total_spent: string;
  avatar_url: string;
  meta_data: WooMetaData[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  status: string;
  type: string;
  price: string;
  regular_price: string;
  sale_price: string;
  total_sales: number;
  stock_quantity: number | null;
  stock_status: string;
  categories: { id: number; name: string }[];
  images: { id: number; src: string }[];
  date_created: string;
}

// Analytics Types
export interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDate: { date: string; total: number; orders: number }[];
  salesByProduct: { productId: number; name: string; total: number; quantity: number }[];
  topProducts: { name: string; sales: number; quantity: number }[];
}

export interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  newCustomersFromAds: number;
  customersByDate: { date: string; count: number }[];
  customerRetention: number;
  topCustomers: { id: number; name: string; totalSpent: number; ordersCount: number }[];
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
