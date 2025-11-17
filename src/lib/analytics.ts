import { WooOrder, WooProduct } from "@/types";

// Frequently Bought Together Analysis
export interface ProductPair {
  product1: { id: number; name: string };
  product2: { id: number; name: string };
  frequency: number;
  confidence: number; // % of orders with product1 that also have product2
  lift: number; // How much more likely to be bought together vs independently
}

export function analyzeFrequentlyBoughtTogether(
  orders: WooOrder[],
  minSupport: number = 2
): ProductPair[] {
  const validOrders = orders.filter((o) =>
    ["completed", "processing", "on-hold"].includes(o.status)
  );

  // Count single product occurrences
  const productCounts = new Map<number, { name: string; count: number }>();
  // Count product pair occurrences
  const pairCounts = new Map<string, { p1: number; p2: number; n1: string; n2: string; count: number }>();

  validOrders.forEach((order) => {
    const productIds = order.line_items.map((item) => ({
      id: item.product_id,
      name: item.name,
    }));

    // Count single products
    productIds.forEach((product) => {
      const existing = productCounts.get(product.id);
      if (existing) {
        existing.count++;
      } else {
        productCounts.set(product.id, { name: product.name, count: 1 });
      }
    });

    // Count pairs (only if more than 1 unique product)
    const uniqueProducts = Array.from(
      new Map(productIds.map((p) => [p.id, p])).values()
    );

    if (uniqueProducts.length > 1) {
      for (let i = 0; i < uniqueProducts.length; i++) {
        for (let j = i + 1; j < uniqueProducts.length; j++) {
          const p1 = uniqueProducts[i];
          const p2 = uniqueProducts[j];

          // Create consistent key (smaller id first)
          const key = p1.id < p2.id ? `${p1.id}-${p2.id}` : `${p2.id}-${p1.id}`;
          const existing = pairCounts.get(key);

          if (existing) {
            existing.count++;
          } else {
            pairCounts.set(key, {
              p1: p1.id < p2.id ? p1.id : p2.id,
              p2: p1.id < p2.id ? p2.id : p1.id,
              n1: p1.id < p2.id ? p1.name : p2.name,
              n2: p1.id < p2.id ? p2.name : p1.name,
              count: 1,
            });
          }
        }
      }
    }
  });

  const totalOrders = validOrders.length;
  const pairs: ProductPair[] = [];

  pairCounts.forEach((pair) => {
    if (pair.count >= minSupport) {
      const p1Count = productCounts.get(pair.p1)?.count || 1;
      const p2Count = productCounts.get(pair.p2)?.count || 1;

      // Confidence: P(p2|p1) = P(p1 and p2) / P(p1)
      const confidence = pair.count / p1Count;

      // Lift: P(p1 and p2) / (P(p1) * P(p2))
      const expectedCooccurrence = (p1Count / totalOrders) * (p2Count / totalOrders) * totalOrders;
      const lift = pair.count / expectedCooccurrence;

      pairs.push({
        product1: { id: pair.p1, name: pair.n1 },
        product2: { id: pair.p2, name: pair.n2 },
        frequency: pair.count,
        confidence: confidence * 100, // as percentage
        lift,
      });
    }
  });

  // Sort by frequency (most common pairs first)
  return pairs.sort((a, b) => b.frequency - a.frequency);
}

// Sales Velocity Analysis
export interface ProductVelocity {
  productId: number;
  name: string;
  totalSales: number;
  avgDailySales: number;
  trend: "increasing" | "decreasing" | "stable";
  daysToSellOut: number | null;
}

export function analyzeProductVelocity(
  orders: WooOrder[],
  products: WooProduct[],
  periodDays: number = 30
): ProductVelocity[] {
  const validOrders = orders.filter((o) =>
    ["completed", "processing", "on-hold"].includes(o.status)
  );

  const productSales = new Map<number, { name: string; quantities: number[] }>();

  // Initialize all products
  products.forEach((product) => {
    productSales.set(product.id, {
      name: product.name,
      quantities: Array(periodDays).fill(0),
    });
  });

  // Count sales per day
  const now = new Date();
  validOrders.forEach((order) => {
    const orderDate = new Date(order.date_created);
    const daysAgo = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAgo >= 0 && daysAgo < periodDays) {
      order.line_items.forEach((item) => {
        const productData = productSales.get(item.product_id);
        if (productData) {
          productData.quantities[daysAgo] += item.quantity;
        }
      });
    }
  });

  const velocities: ProductVelocity[] = [];

  productSales.forEach((data, productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const totalSales = data.quantities.reduce((a, b) => a + b, 0);
    const avgDailySales = totalSales / periodDays;

    // Calculate trend (compare first half vs second half)
    const firstHalf = data.quantities.slice(Math.floor(periodDays / 2));
    const secondHalf = data.quantities.slice(0, Math.floor(periodDays / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    const changePercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    if (changePercent > 10) trend = "increasing";
    else if (changePercent < -10) trend = "decreasing";

    // Days to sell out (if stock available)
    let daysToSellOut: number | null = null;
    if (product.stock_quantity !== null && avgDailySales > 0) {
      daysToSellOut = Math.ceil(product.stock_quantity / avgDailySales);
    }

    velocities.push({
      productId,
      name: data.name,
      totalSales,
      avgDailySales,
      trend,
      daysToSellOut,
    });
  });

  return velocities.sort((a, b) => b.totalSales - a.totalSales);
}

// Revenue Forecast (Simple Linear Projection)
export interface RevenueForecast {
  date: string;
  projectedRevenue: number;
  lowerBound: number;
  upperBound: number;
}

export function forecastRevenue(
  historicalData: { date: string; revenue: number }[],
  forecastDays: number = 7
): RevenueForecast[] {
  if (historicalData.length < 7) {
    return [];
  }

  // Simple moving average
  const values = historicalData.map((d) => d.revenue);
  const n = values.length;

  // Calculate average daily revenue
  const avgRevenue = values.reduce((a, b) => a + b, 0) / n;

  // Calculate standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avgRevenue, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Simple trend calculation
  let slope = 0;
  if (n > 1) {
    const xMean = (n - 1) / 2;
    const yMean = avgRevenue;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    slope = denominator > 0 ? numerator / denominator : 0;
  }

  // Generate forecast
  const forecasts: RevenueForecast[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= forecastDays; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    const projectedRevenue = Math.max(0, avgRevenue + slope * (n + i - 1));
    const lowerBound = Math.max(0, projectedRevenue - 1.96 * stdDev);
    const upperBound = projectedRevenue + 1.96 * stdDev;

    forecasts.push({
      date: forecastDate.toISOString().split("T")[0],
      projectedRevenue,
      lowerBound,
      upperBound,
    });
  }

  return forecasts;
}

// Customer Segmentation (RFM-based)
export interface CustomerSegment {
  segment: string;
  description: string;
  count: number;
  revenue: number;
  avgOrderValue: number;
  color: string;
}

export function segmentCustomers(
  orders: WooOrder[]
): CustomerSegment[] {
  const customerStats = new Map<
    number,
    { lastOrder: Date; orderCount: number; totalSpent: number }
  >();

  const validOrders = orders.filter((o) =>
    ["completed", "processing", "on-hold"].includes(o.status)
  );

  validOrders.forEach((order) => {
    if (order.customer_id === 0) return; // Skip guests

    const existing = customerStats.get(order.customer_id);
    const orderDate = new Date(order.date_created);

    if (existing) {
      if (orderDate > existing.lastOrder) {
        existing.lastOrder = orderDate;
      }
      existing.orderCount++;
      existing.totalSpent += parseFloat(order.total);
    } else {
      customerStats.set(order.customer_id, {
        lastOrder: orderDate,
        orderCount: 1,
        totalSpent: parseFloat(order.total),
      });
    }
  });

  const now = new Date();
  const segments: Record<string, CustomerSegment> = {
    champions: {
      segment: "Champions",
      description: "Recent, frequent, high spenders",
      count: 0,
      revenue: 0,
      avgOrderValue: 0,
      color: "#10B981",
    },
    loyal: {
      segment: "Loyal Customers",
      description: "Regular buyers",
      count: 0,
      revenue: 0,
      avgOrderValue: 0,
      color: "#3B82F6",
    },
    potential: {
      segment: "Potential Loyalists",
      description: "Recent customers with potential",
      count: 0,
      revenue: 0,
      avgOrderValue: 0,
      color: "#8B5CF6",
    },
    atRisk: {
      segment: "At Risk",
      description: "Haven't purchased recently",
      count: 0,
      revenue: 0,
      avgOrderValue: 0,
      color: "#F59E0B",
    },
    lost: {
      segment: "Lost",
      description: "No activity in long time",
      count: 0,
      revenue: 0,
      avgOrderValue: 0,
      color: "#EF4444",
    },
  };

  customerStats.forEach((stats) => {
    const daysSinceOrder = Math.floor(
      (now.getTime() - stats.lastOrder.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgOrderValue = stats.totalSpent / stats.orderCount;

    let segmentKey: string;

    if (daysSinceOrder <= 30 && stats.orderCount >= 3 && stats.totalSpent >= 200) {
      segmentKey = "champions";
    } else if (stats.orderCount >= 3 && daysSinceOrder <= 90) {
      segmentKey = "loyal";
    } else if (daysSinceOrder <= 60 && stats.orderCount >= 1) {
      segmentKey = "potential";
    } else if (daysSinceOrder <= 180) {
      segmentKey = "atRisk";
    } else {
      segmentKey = "lost";
    }

    segments[segmentKey].count++;
    segments[segmentKey].revenue += stats.totalSpent;
  });

  // Calculate average order values
  Object.values(segments).forEach((seg) => {
    if (seg.count > 0) {
      seg.avgOrderValue = seg.revenue / seg.count;
    }
  });

  return Object.values(segments).filter((s) => s.count > 0);
}
