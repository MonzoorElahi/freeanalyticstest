# WooCommerce Analytics Dashboard

A modern, interactive analytics dashboard for WooCommerce stores built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Chart.js.

## Features

- **Real-time Analytics**: View comprehensive sales, customer, and product metrics
- **Sales Tracking**: Monitor revenue, orders, and average order value with trend analysis
- **Customer Insights**: Track new customers, customer retention, and acquisition sources
- **Product Performance**: Analyze top-selling products and inventory status
- **Advertisement Attribution**: Track customers acquired through ads (Google Ads, Facebook Ads, etc.)
- **Interactive Charts**: Beautiful, responsive charts with Chart.js
- **Date Range Filtering**: Analyze data for 7, 14, 30, 60, or 90 days
- **Secure Session Management**: Credentials stored in encrypted sessions

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Chart.js + React Chart.js 2
- **Icons**: Lucide React
- **API**: WooCommerce REST API
- **Auth**: Iron Session (encrypted session-based authentication)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A WooCommerce store with REST API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ana-test
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# Create .env.local file
SESSION_SECRET=your_secret_key_at_least_32_characters_long
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting WooCommerce API Keys

1. Go to your WooCommerce store admin panel
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Click **Add Key**
4. Set:
   - Description: "Analytics Dashboard"
   - User: Your admin user
   - Permissions: **Read** (minimum required)
5. Click **Generate API Key**
6. Copy the **Consumer Key** and **Consumer Secret**

### Connecting Your Store

1. Enter your store URL (e.g., `https://yourstore.com`)
2. Paste your Consumer Key
3. Paste your Consumer Secret
4. Click **Connect Store**

## Dashboard Pages

### Overview (`/dashboard`)
- Key performance metrics with growth indicators
- Revenue and orders trend chart
- Top products by revenue
- New customers over time
- Customer acquisition sources
- Top customers by total spend

### Sales (`/dashboard/sales`)
- Detailed sales analytics
- Switch between line and bar charts
- Product performance by revenue or units sold
- Complete sales breakdown by product

### Orders (`/dashboard/orders`)
- View all store orders
- Search by order ID, customer name, or email
- Filter by order status
- Order details including items and totals

### Customers (`/dashboard/customers`)
- Customer list with search and sorting
- New customers metrics
- Estimated ad-acquired customers
- Customer registration trends
- Customer lifetime value tracking

### Products (`/dashboard/products`)
- Product catalog with images
- Sort by sales, price, or date
- Stock status indicators
- Category information
- Total units sold per product

### Settings (`/dashboard/settings`)
- View connected store information
- Security and privacy information
- Disconnect store option

## Data Analytics

### Sales Metrics
- Total Revenue
- Total Orders
- Average Order Value
- Revenue Growth (vs. previous period)
- Orders Growth

### Customer Metrics
- Total Customers
- New Customers (in selected period)
- Customers from Ads (based on UTM parameters, gclid, fbclid)
- Customer Retention Rate
- Top Customers by Spend

### Product Metrics
- Sales per Product (revenue and units)
- Top-Selling Products
- Stock Status
- Average Product Price

## Security

- API credentials are encrypted in session storage
- No data is stored on external servers
- All data is fetched directly from your WooCommerce store
- Sessions expire after 7 days of inactivity
- HTTPS recommended for production

## Customization

### Changing Date Ranges
The dashboard supports custom date ranges. Modify the `dateOptions` array in `DashboardHeader.tsx` to add more options.

### Adding New Metrics
1. Update types in `src/types/index.ts`
2. Modify the analytics calculation in `src/app/api/woocommerce/analytics/route.ts`
3. Add new metric cards or charts in the dashboard components

### Styling
The dashboard uses Tailwind CSS. Customize colors and themes in `tailwind.config.ts` and `src/app/globals.css`.

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. For production, ensure:
   - Set a strong `SESSION_SECRET` environment variable
   - Use HTTPS
   - Configure proper CORS settings if needed

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
