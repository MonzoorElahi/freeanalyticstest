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
  meta_data?: WooMetaData[];
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
  orderSourceTrends?: {
    date: string;
    sources: { source: string; count: number; revenue: number }[];
  }[];
  newCustomersBySource?: {
    date: string;
    sources: { source: string; count: number }[];
  }[];
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

// Expense Types
export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  source?: string; // e.g., "Google Ads", "Facebook Ads" for ad spend
  createdAt: string;
  paymentMethod?: string;
  vendor?: string;
  receipt?: string;
  notes?: string;
  recurring?: boolean;
  recurringInterval?: "monthly" | "quarterly" | "yearly";
  tags?: string[];
}

export type ExpenseCategory =
  | "Marketing"
  | "Advertising"
  | "Shipping"
  | "Software"
  | "Operations"
  | "Salaries"
  | "Rent"
  | "Utilities"
  | "Other";

export interface ExpenseAnalytics {
  totalExpenses: number;
  expensesByCategory: {
    category: ExpenseCategory;
    total: number;
    count: number;
    percentage: number;
  }[];
  expensesByMonth: {
    month: string;
    total: number;
    count: number;
  }[];
  expensesBySource: {
    source: string;
    total: number;
    count: number;
  }[];
  topExpenses: Expense[];
  averageExpense: number;
  monthlyAverage: number;
  recurringExpenses: {
    total: number;
    count: number;
    byInterval: {
      interval: string;
      total: number;
      count: number;
    }[];
  };
  expenseTrend: {
    current: number;
    previous: number;
    change: number;
    percentageChange: number;
  };
  budgetStatus?: {
    budget: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  };
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
  source?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  recurring?: boolean;
  vendor?: string;
}

// Profit/Loss Types
export interface ProfitMetrics {
  revenue: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  grossMargin: number; // percentage
  expenses: number;
  netProfit: number;
  netMargin: number; // percentage
  roi: number; // Return on Investment percentage
}

export interface ProfitByDate {
  date: string;
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface ProductProfitability {
  productId: number;
  name: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  margin: number;
  unitsSold: number;
}

export interface ExpenseByCategory {
  category: ExpenseCategory;
  total: number;
  count: number;
}

// MailChimp Types
export interface MailChimpCampaign {
  id: string;
  web_id: number;
  type: string;
  create_time: string;
  archive_url: string;
  status: string;
  emails_sent: number;
  send_time?: string;
  settings: {
    subject_line: string;
    title: string;
    from_name: string;
  };
}

export interface MailChimpReport {
  id: string;
  campaign_title: string;
  type: string;
  emails_sent: number;
  abuse_reports: number;
  unsubscribed: number;
  send_time: string;
  opens: {
    opens_total: number;
    unique_opens: number;
    open_rate: number;
  };
  clicks: {
    clicks_total: number;
    unique_clicks: number;
    click_rate: number;
  };
  ecommerce: {
    total_orders: number;
    total_spent: number;
    total_revenue: number;
  };
}

export interface MailChimpProductActivity {
  product_id: string;
  product_title: string;
  total_revenue: number;
  total_purchased: number;
}

export interface MailChimpListStats {
  member_count: number;
  unsubscribe_count: number;
  cleaned_count: number;
  member_count_since_send: number;
  unsubscribe_count_since_send: number;
  cleaned_count_since_send: number;
  campaign_count: number;
  open_rate: number;
  click_rate: number;
}

export interface MailChimpGrowthHistory {
  month: string;
  existing: number;
  imports: number;
  optins: number;
}

export interface MailChimpEngagementFunnel {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  purchased: number;
}

export interface MailChimpInsight {
  type: "success" | "warning" | "info" | "tip";
  title: string;
  description: string;
  metric?: number;
  trend?: "up" | "down" | "neutral";
}

export interface MailChimpEmailClient {
  client: string;
  opens: number;
  clicks: number;
  percentage: number;
}

export interface MailChimpDeviceStats {
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  opens: number;
  clicks: number;
  percentage: number;
}

export interface MailChimpLocationStats {
  country: string;
  opens: number;
  clicks: number;
  orders: number;
  revenue: number;
}

export interface MailChimpClickActivity {
  url: string;
  totalClicks: number;
  uniqueClicks: number;
  clickRate: number;
}

export interface MailChimpCampaignScore {
  campaignId: string;
  campaignTitle: string;
  overallScore: number; // 0-100
  openRateScore: number;
  clickRateScore: number;
  conversionScore: number;
  deliverabilityScore: number;
  subjectLineScore: number;
  recommendations: string[];
}

export interface MailChimpTimeOfDayStats {
  hour: number;
  opens: number;
  clicks: number;
  avgOpenRate: number;
  avgClickRate: number;
  campaignsSent: number;
}

export interface MailChimpSubjectLineAnalysis {
  avgLength: number;
  avgOpenRate: number;
  topPerformingLength: { min: number; max: number; avgOpenRate: number };
  emojiUsage: { used: number; notUsed: number };
  personalizationUsage: { used: number; notUsed: number };
}

export interface MailChimpAnalytics {
  campaigns: MailChimpCampaign[];
  reports: MailChimpReport[];
  revenueByDate: {
    date: string;
    revenue: number;
    orders: number;
    opens: number;
    clicks: number;
  }[];
  ebookDownloads: {
    date: string;
    downloads: number;
    revenue: number;
  }[];
  topCampaigns: {
    id: string;
    title: string;
    revenue: number;
    orders: number;
    openRate: number;
    clickRate: number;
    sendTime: string;
    emailsSent: number;
    bounceRate: number;
  }[];
  productSales: {
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
  }[];
  totalMetrics: {
    totalRevenue: number;
    totalOrders: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalEmailsSent: number;
    avgBounceRate: number;
    conversionRate: number;
    totalUniqueOpens: number;
    totalUniqueClicks: number;
    avgTimeToOpen: number; // in hours
  };
  subscriberGrowth: {
    date: string;
    subscribers: number;
    unsubscribed: number;
    netGrowth: number;
  }[];
  listStats?: MailChimpListStats;
  engagementFunnel: MailChimpEngagementFunnel;
  insights: MailChimpInsight[];
  campaignsByDay: {
    day: string;
    count: number;
    avgOpenRate: number;
    avgClickRate: number;
  }[];
  bestPerformingTime: {
    hour: number;
    dayOfWeek: string;
    avgOpenRate: number;
    avgClickRate: number;
  } | null;
  emailClients: MailChimpEmailClient[];
  deviceStats: MailChimpDeviceStats[];
  locationStats: MailChimpLocationStats[];
  topClickedLinks: MailChimpClickActivity[];
  campaignScores: MailChimpCampaignScore[];
  timeOfDayStats: MailChimpTimeOfDayStats[];
  subjectLineAnalysis: MailChimpSubjectLineAnalysis;
  emailHealthScore: {
    score: number; // 0-100
    listHealthScore: number;
    engagementScore: number;
    deliverabilityScore: number;
    growthScore: number;
    factors: { name: string; score: number; impact: "positive" | "negative" | "neutral"; description: string }[];
  };
}
