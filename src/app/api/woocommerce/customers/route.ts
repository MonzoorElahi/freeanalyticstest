import { getSession } from "@/lib/session";
import { createWooClient, fetchCustomers } from "@/lib/woocommerce";
import { dateRangeSchema } from "@/lib/validations";
import { successResponse, handleApiError, requireAuth } from "@/lib/api-response";
import { withCache } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    await requireAuth(session);

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryParams = dateRangeSchema.parse({
      after: searchParams.get("after") || undefined,
      before: searchParams.get("before") || undefined,
    });

    const client = createWooClient(session.credentials!);

    // Cache customers for 3 minutes
    const cacheKey = `customers:${session.credentials!.url}:${JSON.stringify(queryParams)}`;
    const customers = await withCache(
      cacheKey,
      () => fetchCustomers(client, queryParams),
      180
    );

    return successResponse(
      { customers, count: customers.length },
      { cached: true, cacheExpiry: 180 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
