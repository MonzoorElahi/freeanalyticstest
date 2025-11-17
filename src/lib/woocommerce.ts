import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { WooCredentials, WooOrder, WooCustomer, WooProduct } from "@/types";

export function createWooClient(credentials: WooCredentials) {
  return new WooCommerceRestApi({
    url: credentials.url,
    consumerKey: credentials.key,
    consumerSecret: credentials.secret,
    version: "wc/v3",
  });
}

export async function fetchOrders(
  client: WooCommerceRestApi,
  params: {
    after?: string;
    before?: string;
    per_page?: number;
    page?: number;
    status?: string;
  } = {}
): Promise<WooOrder[]> {
  const allOrders: WooOrder[] = [];
  let page = 1;
  const perPage = params.per_page || 100;

  try {
    while (true) {
      const response = await client.get("orders", {
        ...params,
        per_page: perPage,
        page,
        orderby: "date",
        order: "desc",
      });

      const orders = response.data as WooOrder[];
      if (orders.length === 0) break;

      allOrders.push(...orders);

      if (orders.length < perPage) break;
      page++;

      // Safety limit
      if (page > 50) break;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return allOrders;
}

export async function fetchCustomers(
  client: WooCommerceRestApi,
  params: {
    after?: string;
    before?: string;
    per_page?: number;
    page?: number;
    role?: string;
  } = {}
): Promise<WooCustomer[]> {
  const allCustomers: WooCustomer[] = [];
  let page = 1;
  const perPage = params.per_page || 100;

  try {
    while (true) {
      const response = await client.get("customers", {
        ...params,
        per_page: perPage,
        page,
        orderby: "registered_date",
        order: "desc",
      });

      const customers = response.data as WooCustomer[];
      if (customers.length === 0) break;

      allCustomers.push(...customers);

      if (customers.length < perPage) break;
      page++;

      if (page > 50) break;
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }

  return allCustomers;
}

export async function fetchProducts(
  client: WooCommerceRestApi,
  params: {
    per_page?: number;
    page?: number;
    status?: string;
  } = {}
): Promise<WooProduct[]> {
  const allProducts: WooProduct[] = [];
  let page = 1;
  const perPage = params.per_page || 100;

  try {
    while (true) {
      const response = await client.get("products", {
        ...params,
        per_page: perPage,
        page,
        orderby: "date",
        order: "desc",
      });

      const products = response.data as WooProduct[];
      if (products.length === 0) break;

      allProducts.push(...products);

      if (products.length < perPage) break;
      page++;

      if (page > 50) break;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return allProducts;
}

export async function testConnection(credentials: WooCredentials): Promise<boolean> {
  try {
    const client = createWooClient(credentials);
    await client.get("system_status");
    return true;
  } catch {
    return false;
  }
}
