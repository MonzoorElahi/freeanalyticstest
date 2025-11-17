import { getSession } from "@/lib/session";
import { createWooClient, fetchProducts } from "@/lib/woocommerce";
import { successResponse, handleApiError, requireAuth } from "@/lib/api-response";
import { withCache } from "@/lib/cache";

export async function GET() {
  try {
    const session = await getSession();
    await requireAuth(session);

    const client = createWooClient(session.credentials!);

    // Cache products for 5 minutes (products change less frequently)
    const cacheKey = `products:${session.credentials!.url}`;
    const products = await withCache(
      cacheKey,
      () => fetchProducts(client, { status: "publish" }),
      300
    );

    return successResponse(
      { products, count: products.length },
      { cached: true, cacheExpiry: 300 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
