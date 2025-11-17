import { getSession } from "@/lib/session";
import { successResponse, handleApiError } from "@/lib/api-response";
import { clearCache } from "@/lib/cache";

export async function POST() {
  try {
    const session = await getSession();

    // Clear user-specific cache
    if (session.credentials?.url) {
      clearCache(session.credentials.url);
    }

    // Clear session
    session.isLoggedIn = false;
    session.credentials = undefined;
    await session.save();

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
