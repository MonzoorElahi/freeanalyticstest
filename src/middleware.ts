import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${request.nextUrl.pathname}`;
}

function checkRateLimit(key: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Add request ID header for tracking
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // Log request (in production, use proper logging service)
  console.log(`[${requestId}] ${request.method} ${pathname}`);

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    const rateLimitKey = getRateLimitKey(request);

    // Stricter rate limits for sensitive endpoints
    let limit = 100;
    let window = 60000;

    if (pathname === "/api/auth/login") {
      limit = 5; // 5 login attempts per minute
      window = 60000;
    } else if (pathname === "/api/export") {
      limit = 10; // 10 exports per minute
      window = 60000;
    }

    if (!checkRateLimit(rateLimitKey, limit, window)) {
      console.log(`[${requestId}] Rate limited: ${rateLimitKey}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            ...securityHeaders,
          },
        }
      );
    }
  }

  // Continue with modified request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add request ID to response for debugging
  response.headers.set("x-request-id", requestId);

  // Log response time (would be more accurate with actual response tracking)
  const duration = Date.now() - startTime;
  console.log(`[${requestId}] Completed in ${duration}ms`);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
