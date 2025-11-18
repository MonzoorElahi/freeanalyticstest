/**
 * Memoized Chart Components
 * Performance-optimized versions with React.memo
 */

import { memo } from "react";
import SalesChart from "./SalesChart";
import ProductSalesChart from "./ProductSalesChart";
import CustomerChart from "./CustomerChart";
import DoughnutChart from "./DoughnutChart";
import ComparisonChart from "./ComparisonChart";
import ProductTrendChart from "./ProductTrendChart";

// Memoized versions with deep comparison for data arrays
export const MemoizedSalesChart = memo(
  SalesChart,
  (prevProps, nextProps) =>
    prevProps.type === nextProps.type &&
    prevProps.showOrders === nextProps.showOrders &&
    prevProps.currency === nextProps.currency &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
);

MemoizedSalesChart.displayName = "MemoizedSalesChart";

export const MemoizedProductSalesChart = memo(
  ProductSalesChart,
  (prevProps, nextProps) =>
    prevProps.metric === nextProps.metric &&
    prevProps.currency === nextProps.currency &&
    prevProps.onBarClick === nextProps.onBarClick &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
);

MemoizedProductSalesChart.displayName = "MemoizedProductSalesChart";

export const MemoizedCustomerChart = memo(
  CustomerChart,
  (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
);

MemoizedCustomerChart.displayName = "MemoizedCustomerChart";

export const MemoizedDoughnutChart = memo(
  DoughnutChart,
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.onSegmentClick === nextProps.onSegmentClick &&
    JSON.stringify(prevProps.labels) === JSON.stringify(nextProps.labels) &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
);

MemoizedDoughnutChart.displayName = "MemoizedDoughnutChart";

export const MemoizedComparisonChart = memo(
  ComparisonChart,
  (prevProps, nextProps) =>
    prevProps.currentLabel === nextProps.currentLabel &&
    prevProps.previousLabel === nextProps.previousLabel &&
    prevProps.valueFormatter === nextProps.valueFormatter &&
    JSON.stringify(prevProps.currentData) === JSON.stringify(nextProps.currentData) &&
    JSON.stringify(prevProps.previousData) === JSON.stringify(nextProps.previousData)
);

MemoizedComparisonChart.displayName = "MemoizedComparisonChart";

export const MemoizedProductTrendChart = memo(
  ProductTrendChart,
  (prevProps, nextProps) =>
    prevProps.topN === nextProps.topN &&
    prevProps.valueFormatter === nextProps.valueFormatter &&
    JSON.stringify(prevProps.salesByProduct) === JSON.stringify(nextProps.salesByProduct) &&
    JSON.stringify(prevProps.salesByDate) === JSON.stringify(nextProps.salesByDate)
);

MemoizedProductTrendChart.displayName = "MemoizedProductTrendChart";
