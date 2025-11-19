import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { WooCredentials, WooOrder, WooCustomer, WooProduct } from "@/types";

export function createWooClient(credentials: WooCredentials) {
  return new WooCommerceRestApi({
    url: credentials.url,
    consumerKey: credentials.key,
    consumerSecret: credentials.secret,
    version: "wc/v3",
    timeout: 30000, // 30 second timeout
  });
}

// Helper function to delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication errors (401, 403) or client errors (400-499)
      const statusCode = error?.response?.status || error?.status;
      if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = delayMs * Math.pow(2, attempt - 1);
      console.log(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }

  throw lastError;
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
  const perPage = Math.min(params.per_page || 100, 100); // Cap at 100 per page

  try {
    while (true) {
      const response = await retryApiCall(() =>
        client.get("orders", {
          ...params,
          per_page: perPage,
          page,
          orderby: "date",
          order: "desc",
        })
      );

      const orders = response.data as WooOrder[];
      if (orders.length === 0) break;

      allOrders.push(...orders);

      if (orders.length < perPage) break;
      page++;

      // Safety limit to prevent infinite loops
      if (page > 50) {
        console.warn("Reached maximum page limit (50) for orders");
        break;
      }
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status;
    console.error(`Error fetching orders (status ${statusCode}):`, errorMessage);
    throw new Error(`Failed to fetch orders from WooCommerce: ${errorMessage}`);
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
  const perPage = Math.min(params.per_page || 100, 100); // Cap at 100 per page

  try {
    while (true) {
      const response = await retryApiCall(() =>
        client.get("customers", {
          ...params,
          per_page: perPage,
          page,
          orderby: "registered_date",
          order: "desc",
        })
      );

      const customers = response.data as WooCustomer[];
      if (customers.length === 0) break;

      allCustomers.push(...customers);

      if (customers.length < perPage) break;
      page++;

      // Safety limit
      if (page > 50) {
        console.warn("Reached maximum page limit (50) for customers");
        break;
      }
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status;
    console.error(`Error fetching customers (status ${statusCode}):`, errorMessage);
    throw new Error(`Failed to fetch customers from WooCommerce: ${errorMessage}`);
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
  const perPage = Math.min(params.per_page || 100, 100); // Cap at 100 per page

  try {
    while (true) {
      const response = await retryApiCall(() =>
        client.get("products", {
          ...params,
          per_page: perPage,
          page,
          orderby: "date",
          order: "desc",
        })
      );

      const products = response.data as WooProduct[];
      if (products.length === 0) break;

      allProducts.push(...products);

      if (products.length < perPage) break;
      page++;

      // Safety limit
      if (page > 50) {
        console.warn("Reached maximum page limit (50) for products");
        break;
      }
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status;
    console.error(`Error fetching products (status ${statusCode}):`, errorMessage);
    throw new Error(`Failed to fetch products from WooCommerce: ${errorMessage}`);
  }

  return allProducts;
}

export async function testConnection(credentials: WooCredentials): Promise<boolean> {
  try {
    const client = createWooClient(credentials);
    await retryApiCall(() => client.get("system_status"), 2, 500);
    return true;
  } catch (error) {
    console.error("WooCommerce connection test failed:", error);
    return false;
  }
}
