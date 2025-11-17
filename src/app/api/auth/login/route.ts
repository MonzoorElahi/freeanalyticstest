import { getSession } from "@/lib/session";
import { testConnection } from "@/lib/woocommerce";
import { loginSchema } from "@/lib/validations";
import { successResponse, handleApiError, ApiError, ErrorCodes } from "@/lib/api-response";
import { WooCredentials } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = loginSchema.parse(body);

    // Clean URL - remove trailing slash
    const cleanUrl = validatedData.url.replace(/\/$/, "");

    const credentials: WooCredentials = {
      url: cleanUrl,
      key: validatedData.key,
      secret: validatedData.secret,
    };

    // Test connection to WooCommerce
    const isValid = await testConnection(credentials);

    if (!isValid) {
      throw new ApiError(
        ErrorCodes.AUTHENTICATION_ERROR,
        "Invalid credentials or unable to connect to WooCommerce store",
        401
      );
    }

    // Save to session
    const session = await getSession();
    session.isLoggedIn = true;
    session.credentials = credentials;
    await session.save();

    return successResponse(
      { message: "Connected successfully" },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
