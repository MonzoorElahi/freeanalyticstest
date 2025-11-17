import { getSession } from "@/lib/session";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();

    return successResponse({
      isLoggedIn: session.isLoggedIn || false,
      storeUrl: session.credentials?.url || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
