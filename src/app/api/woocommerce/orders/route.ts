import { getSession } from "@/lib/session";
import { createWooClient, fetchOrders } from "@/lib/woocommerce";
import { orderQuerySchema } from "@/lib/validations";
import { successResponse, handleApiError, requireAuth } from "@/lib/api-response";
import { withCache } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    await requireAuth(session);

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryParams = orderQuerySchema.parse({
      status: searchParams.get("status") || undefined,
      after: searchParams.get("after") || undefined,
      before: searchParams.get("before") || undefined,
    });

    const client = createWooClient(session.credentials!);

    // Cache orders for 2 minutes
    const cacheKey = `orders:${session.credentials!.url}:${JSON.stringify(queryParams)}`;
    const orders = await withCache(
      cacheKey,
      () => fetchOrders(client, queryParams),
      120
    );

    return successResponse(
      { orders, count: orders.length },
      { cached: true, cacheExpiry: 120 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
