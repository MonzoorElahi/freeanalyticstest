# WooCommerce Analytics Dashboard - Complete Project Documentation

> **Version:** 0.1.0
> **Last Updated:** 2025-11-18
> **Framework:** Next.js 16.0.3 (React 19.2.0)
> **Total Files:** 104+ TypeScript/React/CSS files

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features & Capabilities](#features--capabilities)
5. [Component Architecture](#component-architecture)
6. [Analytics & Calculations](#analytics--calculations)
7. [API Integration](#api-integration)
8. [Styling & Design System](#styling--design-system)
9. [Data Flow](#data-flow)
10. [Setup & Installation](#setup--installation)
11. [Recent Enhancements](#recent-enhancements)
12. [Performance Optimizations](#performance-optimizations)

---

## Project Overview

**WooCommerce Analytics Dashboard** is a modern, real-time analytics platform for WooCommerce stores. It provides comprehensive insights into sales, orders, customers, products, expenses, and email marketing campaigns through an intuitive, visually polished interface.

### Key Objectives:
- **Real-time Data Visualization**: Live metrics and charts
- **Multi-dimensional Analytics**: Sales, customers, products, expenses, email marketing
- **User Experience**: Modern UI with micro-interactions and smooth animations
- **Performance**: Optimized rendering with memoization and lazy loading
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

---

## Technology Stack

### Core Framework
- **Next.js 16.0.3**: React framework with App Router
- **React 19.2.0**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Turbopack**: Ultra-fast bundler

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Lucide React 0.554**: Icon library (300+ icons)
- **Custom CSS**: Advanced animations and effects
- **Glassmorphism**: Modern frosted glass effects
- **Gradient System**: Multi-color gradient utilities

### Data & State Management
- **Chart.js 4.5.1**: Canvas-based charting
- **react-chartjs-2 5.3.1**: React wrapper for Chart.js
- **React Hooks**: useState, useEffect, useCallback, useMemo
- **Context API**: Global state (Toast, Theme)

### Backend & API
- **WooCommerce REST API v1.0.2**: E-commerce data integration
- **Iron Session 8.0.4**: Secure session management
- **Zod 4.1.12**: Runtime type validation
- **Next.js API Routes**: Serverless API endpoints

### Utilities
- **date-fns 4.1.0**: Date manipulation and formatting
- **@react-hook/debounce 4.0.0**: Debounced state management
- **Crypto API**: UUID generation for unique IDs

---

## Project Structure

```
ana-test/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Login page (/)
│   │   ├── globals.css               # Global styles & utilities
│   │   └── dashboard/                # Dashboard pages
│   │       ├── layout.tsx            # Dashboard layout with sidebar
│   │       ├── page.tsx              # Overview dashboard
│   │       ├── sales/                # Sales analytics
│   │       ├── orders/               # Orders management
│   │       ├── customers/            # Customer analytics
│   │       ├── products/             # Product analytics
│   │       ├── expenses/             # Expense tracking
│   │       ├── mailchimp/            # Email marketing analytics
│   │       └── settings/             # Settings page
│   │
│   ├── components/                   # React components
│   │   ├── charts/                   # Chart components
│   │   │   ├── SalesChart.tsx        # Time-series sales
│   │   │   ├── ProductSalesChart.tsx # Product performance
│   │   │   ├── DoughnutChart.tsx     # Pie/doughnut charts
│   │   │   ├── ComparisonChart.tsx   # Period comparison
│   │   │   └── [30+ more charts]    # Specialized visualizations
│   │   │
│   │   ├── AnimatedCounter.tsx       # Number animation
│   │   ├── Breadcrumbs.tsx           # Navigation breadcrumbs
│   │   ├── CommandPalette.tsx        # Quick actions (Cmd+K)
│   │   ├── ComparisonMode.tsx        # Period comparison modal
│   │   ├── DashboardContent.tsx      # Main dashboard
│   │   ├── DashboardHeader.tsx       # Page headers
│   │   ├── DateRangePicker.tsx       # Date selection
│   │   ├── EmptyState.tsx            # No data states
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   ├── ExportButton.tsx          # CSV export
│   │   ├── LoginForm.tsx             # Authentication
│   │   ├── MetricCard.tsx            # KPI cards
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── Skeleton.tsx              # Loading states
│   │   ├── SmartInsights.tsx         # AI-powered insights
│   │   ├── Toast.tsx                 # Notifications
│   │   └── [40+ more components]    # Feature-specific
│   │
│   ├── lib/                          # Utilities
│   │   ├── formatters.ts             # Currency, number, date formatting
│   │   ├── session.ts                # Session management
│   │   └── woocommerce.ts            # WooCommerce API client
│   │
│   └── types/                        # TypeScript types
│       └── woocommerce.ts            # API response types
│
├── public/                           # Static assets
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
└── PROJECT_DOCUMENTATION.md          # This file
```

---

## Features & Capabilities

### 1. **Authentication**
- WooCommerce API key authentication
- Secure session management with iron-session
- Real-time validation with visual feedback
- Error handling with detailed messages

### 2. **Dashboard Overview**
- **Key Metrics**: Revenue, orders, customers, average order value
- **Sales Trend**: 30-day revenue chart
- **Top Products**: Best-selling items with sparklines
- **Recent Orders**: Latest transactions
- **Customer Growth**: New customer acquisition
- **Quick Stats Overlay**: Floating metrics (Ctrl+Q)

### 3. **Sales Analytics**
- **Revenue Metrics**: Gross sales, net sales, refunds, shipping, tax
- **Time Series**: Daily/weekly/monthly trends
- **Product Performance**: Sales by product with quantity
- **Category Breakdown**: Sales distribution
- **Payment Methods**: Payment method analysis
- **Geographic Data**: Sales by country
- **Hourly Distribution**: Peak sales times
- **Comparison Mode**: Period-over-period analysis

### 4. **Orders Management**
- **Order Status**: Pending, processing, completed, refunded
- **Order Timeline**: Date-based visualization
- **Customer Orders**: Per-customer analysis
- **Payment Methods**: Method distribution
- **Shipping Costs**: Logistics analysis
- **Order Source Trends**: Marketing attribution

### 5. **Customer Analytics**
- **Customer Growth**: New vs returning customers
- **Customer Lifetime Value**: Revenue per customer
- **Purchase Frequency**: Order patterns
- **Customer Segmentation**: High/medium/low value
- **Geographic Distribution**: Location-based insights
- **Ads Attribution**: Marketing channel effectiveness

### 6. **Product Analytics**
- **Top Products**: Best sellers by revenue and quantity
- **Product Velocity**: Sales trends and projections
- **Category Performance**: Category-wise metrics
- **Stock Insights**: Inventory recommendations
- **Product Trends**: Time-based performance
- **Price Analysis**: Average selling price

### 7. **Expense Management**
- **Expense Tracking**: Manual expense entry
- **Category Management**: Customizable categories
- **Budget Tracking**: Budget vs actual
- **Expense Trends**: Monthly patterns
- **Vendor Analytics**: Vendor-wise spending
- **Profit/Loss**: Revenue vs expenses

### 8. **Email Marketing (MailChimp)**
- **Campaign Performance**: Open rate, click rate, ROI
- **Subscriber Growth**: List growth trends
- **Engagement Funnel**: Open → Click → Purchase
- **Subject Line Analysis**: A/B testing insights
- **Time-of-Day Analysis**: Best send times
- **Email Client Stats**: Client distribution
- **Device Stats**: Mobile vs desktop
- **Geographic Stats**: Location-based engagement

### 9. **Export & Reporting**
- **CSV Export**: Sales, orders, customers, products
- **Date Range Selection**: Custom periods
- **Formatted Data**: Ready for Excel/Google Sheets

### 10. **UX Enhancements**
- **Command Palette**: Quick navigation (Cmd+K / Ctrl+K)
- **Keyboard Shortcuts**: Accessibility features
- **Smart Insights**: AI-powered recommendations
- **Comparison Mode**: Period comparison overlay
- **Live Indicators**: Real-time data updates
- **Breadcrumbs**: Navigation context
- **Empty States**: Helpful no-data messages

---

## Component Architecture

### Component Categories

#### 1. **Layout Components**
- `DashboardWrapper`: Main layout with sidebar and header
- `Sidebar`: Navigation menu with active states
- `DashboardHeader`: Page header with breadcrumbs and filters
- `MobileSidebar`: Responsive mobile navigation

#### 2. **Data Display Components**
- `MetricCard`: KPI card with animations and sparklines
- `AnimatedCounter`: Number animation with easing
- `Sparkline`: Mini inline charts
- `EmptyState`: No data placeholders
- `Skeleton`: Loading state skeletons

#### 3. **Chart Components** (30+ variations)
- **Line Charts**: Sales, revenue, customer trends
- **Bar Charts**: Product sales, category performance
- **Doughnut Charts**: Status distribution, payment methods
- **Comparison Charts**: Period-over-period
- **Specialized**: Funnel, heatmap, geographic

#### 4. **Interaction Components**
- `CommandPalette`: Quick actions and search
- `ComparisonMode`: Period comparison modal
- `DateRangePicker`: Date selection
- `ExportButton`: CSV export dropdown
- `Toast`: Notification system

#### 5. **Form Components**
- `LoginForm`: Authentication with validation
- `ExpenseManager`: Expense entry and editing
- `GoalIndicator`: Progress tracking

#### 6. **Utility Components**
- `ErrorBoundary`: Error catching and recovery
- `Providers`: Context providers wrapper
- `LiveIndicator`: Real-time data indicator
- `QuickStatsOverlay`: Floating stats panel

---

## Analytics & Calculations

### Sales Metrics

#### 1. **Revenue Calculations**
```typescript
grossSales = Σ(order.total)
netSales = grossSales - refunds - discounts
averageOrderValue = grossSales / totalOrders
revenueGrowth = ((current - previous) / previous) * 100
```

#### 2. **Order Metrics**
```typescript
totalOrders = orders.length
ordersGrowth = ((currentOrders - previousOrders) / previousOrders) * 100
avgItemsPerOrder = totalItems / totalOrders
conversionRate = (orders / visitors) * 100  // If tracking enabled
```

#### 3. **Customer Metrics**
```typescript
newCustomers = customers.filter(c => firstOrderInPeriod)
returningCustomers = totalCustomers - newCustomers
customerRetentionRate = (returningCustomers / totalCustomers) * 100
customerLifetimeValue = totalRevenue / uniqueCustomers
avgOrdersPerCustomer = totalOrders / uniqueCustomers
```

#### 4. **Product Metrics**
```typescript
productSales = orders.flatMap(order => order.line_items)
                     .reduce((acc, item) => {
                       acc[item.product_id] = (acc[item.product_id] || 0) + item.total
                       return acc
                     }, {})

productVelocity = {
  avgDailySales: totalSales / dayCount,
  trend: calculateTrend(salesByDate),
  daysToSellOut: stock / avgDailySales
}
```

#### 5. **Expense Calculations**
```typescript
totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
expensesByCategory = groupBy(expenses, 'category')
budgetUtilization = (actualExpenses / budgetAmount) * 100
profitMargin = ((revenue - expenses) / revenue) * 100
netProfit = revenue - expenses
```

#### 6. **Email Marketing Metrics**
```typescript
openRate = (opens / sent) * 100
clickRate = (clicks / sent) * 100
clickToOpenRate = (clicks / opens) * 100
conversionRate = (purchases / clicks) * 100
roi = ((revenue - cost) / cost) * 100
revenuePerEmail = totalRevenue / emailsSent
avgRevenuePerRecipient = totalRevenue / recipientCount
```

### Data Aggregation

#### Time-Series Aggregation
```typescript
// Group by date
const salesByDate = orders.reduce((acc, order) => {
  const date = formatDate(order.date_created)
  if (!acc[date]) {
    acc[date] = { total: 0, orders: 0, items: 0 }
  }
  acc[date].total += parseFloat(order.total)
  acc[date].orders += 1
  acc[date].items += order.line_items.length
  return acc
}, {})
```

#### Trend Calculation
```typescript
function calculateTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  const firstAvg = average(firstHalf)
  const secondAvg = average(secondHalf)
  const change = ((secondAvg - firstAvg) / firstAvg) * 100

  if (change > 5) return 'increasing'
  if (change < -5) return 'decreasing'
  return 'stable'
}
```

#### Growth Rate
```typescript
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
```

---

## API Integration

### WooCommerce REST API

#### Authentication
```typescript
const api = new WooCommerceRestApi({
  url: storeUrl,
  consumerKey: apiKey,
  consumerSecret: apiSecret,
  version: 'wc/v3',
  queryStringAuth: true
})
```

#### Endpoints Used

1. **Orders** (`/orders`)
   - Retrieves order data with line items
   - Supports date filtering: `after`, `before`
   - Includes: `id`, `total`, `status`, `date_created`, `line_items`, `customer_id`

2. **Products** (`/products`)
   - Product catalog with pricing
   - Includes: `id`, `name`, `price`, `stock_quantity`, `categories`

3. **Customers** (`/customers`)
   - Customer profiles and metadata
   - Includes: `id`, `email`, `first_name`, `last_name`, `meta_data`

4. **Reports** (`/reports/*`)
   - Sales reports
   - Top sellers
   - Revenue statistics

#### Data Fetching Strategy
```typescript
// Fetch all orders in date range
const fetchOrders = async (days: number) => {
  const after = subDays(new Date(), days).toISOString()
  const response = await api.get('orders', {
    after,
    per_page: 100,
    page: 1
  })

  // Pagination handling
  let allOrders = response.data
  const totalPages = parseInt(response.headers['x-wp-totalpages'])

  for (let page = 2; page <= totalPages; page++) {
    const pageData = await api.get('orders', {
      after,
      per_page: 100,
      page
    })
    allOrders = [...allOrders, ...pageData.data]
  }

  return allOrders
}
```

### Custom API Routes

#### `/api/auth/login` (POST)
- Validates WooCommerce credentials
- Creates secure session
- Returns success/error status

#### `/api/auth/logout` (POST)
- Destroys session
- Clears cookies

#### `/api/woocommerce/analytics` (GET)
- Query params: `days`, `startDate`, `endDate`
- Returns comprehensive analytics data
- Includes: sales, orders, customers, products

#### `/api/export` (POST)
- Exports data to CSV
- Types: `sales_summary`, `orders`, `customers`, `products`
- Returns downloadable file

---

## Styling & Design System

### Color System

#### Primary Palette
```css
--primary: #9333ea (Purple 600)
--primary-light: #a855f7 (Purple 500)
--primary-dark: #7e22ce (Purple 700)
```

#### Semantic Colors
```css
--success: #10b981 (Green 600)
--warning: #f59e0b (Amber 600)
--error: #ef4444 (Red 600)
--info: #3b82f6 (Blue 600)
```

### Design Patterns

#### 1. **Glassmorphism**
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

#### 2. **Gradient Backgrounds**
```css
.gradient-primary {
  background: linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #ec4899 100%);
}
```

#### 3. **Neumorphism**
```css
.neu-flat {
  box-shadow: 8px 8px 16px #d1d5db, -8px -8px 16px #ffffff;
}
```

### Animation Library

#### Keyframe Animations (15+)
- `fadeIn`: Opacity fade with subtle y-translation
- `slideUp`: Bottom-to-top entrance
- `slide-in-right`: Right-to-left entrance
- `slide-in-left`: Left-to-right entrance
- `bounce-in`: Elastic scale entrance
- `scale-in`: Center scale entrance
- `success-pop`: Success confirmation bounce
- `shake`: Error shake effect
- `float`: Continuous floating motion
- `shimmer`: Loading shimmer effect

#### Utility Classes
```css
.smooth-fast { transition: all 150ms ease-in-out; }
.smooth-hover { transition: all 300ms ease-in-out; }
.smooth-slow { transition: all 500ms ease-in-out; }
```

### Button Variants
- `btn-primary`: Purple with shadow lift
- `btn-secondary`: Gray with subtle hover
- `btn-success`: Green for positive actions
- `btn-danger`: Red for destructive actions
- `btn-warning`: Amber for caution
- `btn-info`: Blue for informational
- `btn-ghost`: Transparent with hover background

### Card Styles
- `metric-card`: Interactive KPI card
- `interactive-card`: Hover lift and shadow
- `card-elevated`: Enhanced shadow on hover
- `glass`: Glassmorphism effect
- `glass-strong`: Stronger glassmorphism

---

## Data Flow

### Overview Page Flow
```
1. User navigates to /dashboard
2. DashboardContent component mounts
3. useEffect triggers fetchData()
4. API route /api/woocommerce/analytics called
5. Server fetches WooCommerce data
6. Data processed and aggregated
7. Response sent to client
8. State updated with setData()
9. Components re-render with new data
10. Charts and metrics display
```

### Sales Page Flow
```
1. User selects date range (7/14/30/60/90 days)
2. fetchData(days) called with new range
3. Loading state set to true
4. API request with ?days=X parameter
5. Server queries WooCommerce API
6. Data aggregated:
   - Revenue by date
   - Product sales
   - Category breakdown
   - Payment methods
   - Geographic distribution
7. Client receives processed data
8. Charts re-render with new datasets
9. Metrics animate to new values
10. Loading state set to false
```

### Export Flow
```
1. User clicks Export button
2. Dropdown shows export options
3. User selects type (sales/orders/customers/products)
4. POST /api/export with type and date range
5. Server fetches relevant data
6. Data formatted as CSV
7. Response sent with Content-Disposition header
8. Browser downloads file
9. Success toast notification
```

---

## Setup & Installation

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm/yarn/pnpm
- WooCommerce store with REST API enabled

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd ana-test
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure Environment** (if using .env)
```env
# Optional: Can configure via UI
NEXT_PUBLIC_APP_NAME=WooCommerce Analytics
```

4. **Run Development Server**
```bash
npm run dev
# Runs on http://localhost:3000
```

5. **Build for Production**
```bash
npm run build
npm start
```

### WooCommerce Setup

1. **Generate API Keys**
   - Go to WooCommerce → Settings → Advanced → REST API
   - Click "Add key"
   - Description: "Analytics Dashboard"
   - User: Admin user
   - Permissions: **Read** (minimum required)
   - Save and copy Consumer Key and Secret

2. **Login to Dashboard**
   - Navigate to http://localhost:3000
   - Enter:
     - Store URL (e.g., https://yourstore.com)
     - Consumer Key (ck_...)
     - Consumer Secret (cs_...)
   - Click "Connect Store"

---

## Recent Enhancements

### Visual Polish Update (2025-11-18)

#### 1. **Extended Color System**
- Added semantic colors: success, warning, error, info
- Dark mode variants for all colors
- CSS custom properties for consistency

#### 2. **Animation Library**
- 15+ custom keyframe animations
- Utility classes for smooth transitions
- State-specific animations (success pop, error shake)

#### 3. **Micro-Interactions**
- Button press animations (scale-95)
- Card hover effects (scale-102, shadow-2xl)
- Icon rotations and floats
- Progress bar animations

#### 4. **Glassmorphism Effects**
- Modal overlays with backdrop blur
- Dropdown menus with frosted glass
- Card backgrounds with transparency
- Two variants: glass, glass-strong

#### 5. **Gradient System**
- Hero backgrounds with overlays
- Button gradients
- Text gradients for headings
- Progress bar gradients

#### 6. **Component Enhancements**
- **MetricCard**: Progress indicators, gradient effects, animated icons
- **Sidebar**: Gradient navigation, floating logo, enhanced states
- **Toast**: State animations, glassmorphism, icon backgrounds
- **LoginForm**: Hero gradient, glassmorphism form, enhanced validation
- **ExportButton**: Glassmorphism dropdown, animated options
- **ComparisonMode**: Gradient header, staggered animations
- **DashboardHeader**: Breadcrumbs integration, glassmorphism dropdown

#### 7. **New Components**
- **Breadcrumbs**: Auto-generated navigation context
- Section dividers (solid, dashed, gradient)
- Enhanced loading states

---

## Performance Optimizations

### 1. **Memoization**
```typescript
// Memoized chart components
const MemoizedSalesChart = React.memo(SalesChart)
const MemoizedProductChart = React.memo(ProductSalesChart)

// useMemo for expensive calculations
const topProducts = useMemo(() =>
  sortBy(products, 'sales').slice(0, 10),
  [products]
)
```

### 2. **useCallback for Event Handlers**
```typescript
const fetchData = useCallback(async () => {
  // API call
}, [days])

useEffect(() => {
  fetchData()
}, [fetchData])
```

### 3. **Code Splitting**
```typescript
// Dynamic imports for heavy components
const CommandPalette = dynamic(() => import('./CommandPalette'), {
  ssr: false
})
```

### 4. **Image Optimization**
```typescript
// Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  width={40}
  height={40}
  alt="Logo"
  priority
/>
```

### 5. **API Response Caching**
```typescript
// Session-based caching
const cachedData = session.get('analytics')
if (cachedData && !forceRefresh) {
  return cachedData
}
```

### 6. **Debounced Search**
```typescript
import { useDebouncedCallback } from '@react-hook/debounce'

const handleSearch = useDebouncedCallback(
  (value) => performSearch(value),
  300
)
```

---

## Error Handling

### Client-Side Errors
```typescript
// Error Boundary
class DashboardErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo)
    showToast({ type: 'error', title: 'Something went wrong' })
  }
}
```

### API Errors
```typescript
try {
  const response = await fetch('/api/woocommerce/analytics')
  if (!response.ok) throw new Error('API Error')
  const data = await response.json()
} catch (error) {
  console.error('Failed to fetch:', error)
  showToast({
    type: 'error',
    title: 'Failed to load data',
    message: 'Please check your connection and try again'
  })
}
```

---

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Escape
- **ARIA Labels**: Proper labels on all interactive elements
- **Focus Management**: Visible focus indicators with custom rings
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Color Contrast**: WCAG AA compliant color combinations
- **Alternative Text**: Descriptive alt text for images and icons

---

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Android 90+

---

## Known Limitations

1. **Real-time Updates**: Data refreshes on user action, not automatic polling
2. **Historical Data**: Limited to WooCommerce data retention
3. **Large Datasets**: May slow with 10,000+ orders (pagination recommended)
4. **Offline Support**: Requires internet connection
5. **Multi-store**: Single store per session

---

## Future Enhancements

### Planned Features
- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Custom dashboard builder
- [ ] Automated insights and alerts
- [ ] Mobile app (React Native)
- [ ] Multi-store management
- [ ] Advanced reporting (PDF, scheduled exports)
- [ ] Inventory predictions with ML
- [ ] Customer segmentation engine
- [ ] A/B testing framework

---

## Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/name`
2. Make changes with TypeScript types
3. Test in dev environment: `npm run dev`
4. Build to verify: `npm run build`
5. Commit with descriptive message
6. Push and create pull request

### Code Style
- Use TypeScript for all new files
- Follow ESLint configuration
- Use functional components with hooks
- Memoize expensive operations
- Add JSDoc comments for complex functions

---

## License

Private Project - All Rights Reserved

---

## Support & Contact

For issues, questions, or feature requests:
- Create GitHub issue
- Email: [support email]
- Documentation: This file

---

**Last Updated:** 2025-11-18
**Documentation Version:** 1.0
**Project Version:** 0.1.0
