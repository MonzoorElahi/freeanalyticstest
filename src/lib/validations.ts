import { z } from "zod";

// Authentication Schemas
export const loginSchema = z.object({
  url: z
    .string()
    .min(1, "Store URL is required")
    .url("Invalid URL format")
    .refine((url) => url.startsWith("https://") || url.startsWith("http://"), {
      message: "URL must start with http:// or https://",
    }),
  key: z
    .string()
    .min(1, "Consumer key is required")
    .regex(/^ck_[a-zA-Z0-9]+$/, "Invalid consumer key format (should start with ck_)"),
  secret: z
    .string()
    .min(1, "Consumer secret is required")
    .regex(/^cs_[a-zA-Z0-9]+$/, "Invalid consumer secret format (should start with cs_)"),
});

// Query Parameter Schemas
export const dateRangeSchema = z.object({
  after: z.string().datetime().optional(),
  before: z.string().datetime().optional(),
  days: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(1).max(365).optional()),
});

export const analyticsQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .default("30")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(365)),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  per_page: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const orderQuerySchema = z.object({
  status: z.enum(["any", "pending", "processing", "on-hold", "completed", "cancelled", "refunded", "failed"]).optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const exportSchema = z.object({
  type: z.enum(["orders", "customers", "products", "sales_summary"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type ExportInput = z.infer<typeof exportSchema>;
