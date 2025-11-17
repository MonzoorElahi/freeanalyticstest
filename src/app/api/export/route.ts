import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createWooClient, fetchOrders, fetchCustomers, fetchProducts } from "@/lib/woocommerce";
import { format, parseISO, subDays } from "date-fns";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.credentials) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, days, startDate, endDate } = body;

    const client = createWooClient(session.credentials);

    let data: unknown[] = [];
    let filename = "";
    let headers: string[] = [];

    const effectiveEndDate = endDate ? new Date(endDate) : new Date();
    const effectiveStartDate = startDate
      ? new Date(startDate)
      : subDays(effectiveEndDate, days || 30);

    if (type === "orders") {
      const orders = await fetchOrders(client, {
        after: format(effectiveStartDate, "yyyy-MM-dd'T'HH:mm:ss"),
        before: format(effectiveEndDate, "yyyy-MM-dd'T'HH:mm:ss"),
      });

      headers = [
        "Order ID",
        "Date",
        "Status",
        "Customer",
        "Email",
        "Country",
        "Items",
        "Subtotal",
        "Tax",
        "Shipping",
        "Discount",
        "Total",
        "Currency",
        "Payment Method",
      ];

      data = orders.map((order) => [
        order.id,
        format(parseISO(order.date_created), "yyyy-MM-dd HH:mm"),
        order.status,
        `${order.billing.first_name} ${order.billing.last_name}`,
        order.billing.email,
        order.billing.country,
        order.line_items.reduce((sum, item) => sum + item.quantity, 0),
        order.subtotal,
        order.total_tax,
        order.shipping_total,
        order.discount_total,
        order.total,
        order.currency,
        order.payment_method_title,
      ]);

      filename = `orders_${format(effectiveStartDate, "yyyy-MM-dd")}_to_${format(effectiveEndDate, "yyyy-MM-dd")}.csv`;
    } else if (type === "customers") {
      const customers = await fetchCustomers(client);

      headers = [
        "Customer ID",
        "First Name",
        "Last Name",
        "Email",
        "Username",
        "Registered Date",
        "Country",
        "Total Orders",
        "Total Spent",
      ];

      data = customers.map((customer) => [
        customer.id,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.username,
        format(parseISO(customer.date_created), "yyyy-MM-dd HH:mm"),
        customer.billing.country,
        customer.orders_count,
        customer.total_spent,
      ]);

      filename = `customers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    } else if (type === "products") {
      const products = await fetchProducts(client);

      headers = [
        "Product ID",
        "Name",
        "SKU",
        "Type",
        "Status",
        "Price",
        "Regular Price",
        "Sale Price",
        "Total Sales",
        "Stock Status",
        "Stock Quantity",
        "Categories",
      ];

      data = products.map((product) => [
        product.id,
        product.name,
        product.sku,
        product.type,
        product.status,
        product.price,
        product.regular_price,
        product.sale_price,
        product.total_sales,
        product.stock_status,
        product.stock_quantity || "N/A",
        product.categories.map((c) => c.name).join(", "),
      ]);

      filename = `products_${format(new Date(), "yyyy-MM-dd")}.csv`;
    } else if (type === "sales_summary") {
      const orders = await fetchOrders(client, {
        after: format(effectiveStartDate, "yyyy-MM-dd'T'HH:mm:ss"),
        before: format(effectiveEndDate, "yyyy-MM-dd'T'HH:mm:ss"),
      });

      // Group by date
      const salesByDate = new Map<
        string,
        { orders: number; revenue: number; items: number }
      >();

      orders
        .filter((o) => ["completed", "processing", "on-hold"].includes(o.status))
        .forEach((order) => {
          const date = format(parseISO(order.date_created), "yyyy-MM-dd");
          const existing = salesByDate.get(date) || {
            orders: 0,
            revenue: 0,
            items: 0,
          };
          salesByDate.set(date, {
            orders: existing.orders + 1,
            revenue: existing.revenue + parseFloat(order.total),
            items:
              existing.items +
              order.line_items.reduce((sum, item) => sum + item.quantity, 0),
          });
        });

      headers = ["Date", "Orders", "Revenue", "Items Sold", "Avg Order Value"];

      data = Array.from(salesByDate.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, stats]) => [
          date,
          stats.orders,
          stats.revenue.toFixed(2),
          stats.items,
          (stats.revenue / stats.orders).toFixed(2),
        ]);

      filename = `sales_summary_${format(effectiveStartDate, "yyyy-MM-dd")}_to_${format(effectiveEndDate, "yyyy-MM-dd")}.csv`;
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    // Generate CSV
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        (row as string[])
          .map((cell) => {
            const cellStr = String(cell);
            // Escape quotes and wrap in quotes if needed
            if (
              cellStr.includes(",") ||
              cellStr.includes('"') ||
              cellStr.includes("\n")
            ) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Return as downloadable file
    return new NextResponse(csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
