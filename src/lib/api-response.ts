import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Standard API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    cached?: boolean;
    cacheExpiry?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Error Codes
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
} as const;

// Custom Error Class
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Response Helpers
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    cached?: boolean;
    cacheExpiry?: number;
    headers?: Record<string, string>;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      cached: options?.cached,
      cacheExpiry: options?.cacheExpiry,
    },
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (options?.cacheExpiry) {
    headers["Cache-Control"] = `private, max-age=${options.cacheExpiry}`;
  }

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers,
  });
}

export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

// Error Handler
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      "Validation failed",
      400,
      error.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }))
    );
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("ECONNREFUSED") || error.message.includes("ETIMEDOUT")) {
      return errorResponse(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        "Unable to connect to WooCommerce store",
        503
      );
    }

    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return errorResponse(
        ErrorCodes.AUTHENTICATION_ERROR,
        "Invalid WooCommerce credentials",
        401
      );
    }

    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return errorResponse(
        ErrorCodes.AUTHORIZATION_ERROR,
        "Insufficient permissions for this operation",
        403
      );
    }
  }

  return errorResponse(
    ErrorCodes.INTERNAL_ERROR,
    "An unexpected error occurred",
    500
  );
}

// Validation Helper
export function validateRequest<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid request data",
        400,
        error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }
    throw error;
  }
}

// Auth Check Helper
export async function requireAuth(
  session: { isLoggedIn?: boolean; credentials?: unknown }
): Promise<void> {
  if (!session.isLoggedIn || !session.credentials) {
    throw new ApiError(ErrorCodes.AUTHENTICATION_ERROR, "Authentication required", 401);
  }
}
