/**
 * Application Constants and Configuration
 * Centralized configuration for easy maintenance
 */

// ============================================================================
// Dashboard Configuration
// ============================================================================

export const DASHBOARD_CONFIG = {
  // Date range presets (in days)
  DATE_RANGES: [
    { label: "Last 7 days", value: 7 },
    { label: "Last 14 days", value: 14 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 60 days", value: 60 },
    { label: "Last 90 days", value: 90 },
  ],

  // Default date range
  DEFAULT_DAYS: 30,

  // Default comparison type
  DEFAULT_COMPARE_TYPE: "previous" as const,

  // Auto-refresh settings
  AUTO_REFRESH: {
    ENABLED: false,
    INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
  },

  // Cache settings
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutes
  },

  // Animation delays for metric cards (ms)
  ANIMATION_DELAYS: {
    CARD_1: 0,
    CARD_2: 100,
    CARD_3: 200,
    CARD_4: 300,
  },
} as const;

// ============================================================================
// Chart Configuration
// ============================================================================

export const CHART_CONFIG = {
  // Default colors for charts
  COLORS: {
    PRIMARY: "rgba(147, 51, 234, 0.8)", // purple-600
    SECONDARY: "rgba(59, 130, 246, 0.8)", // blue-600
    SUCCESS: "rgba(16, 185, 129, 0.8)", // green-600
    WARNING: "rgba(245, 158, 11, 0.8)", // amber-600
    DANGER: "rgba(239, 68, 68, 0.8)", // red-600
    INFO: "rgba(59, 130, 246, 0.8)", // blue-600
  },

  // Color palette for multiple datasets
  PALETTE: [
    "rgba(147, 51, 234, 0.8)", // Purple
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(16, 185, 129, 0.8)", // Green
    "rgba(245, 158, 11, 0.8)", // Amber
    "rgba(239, 68, 68, 0.8)", // Red
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(99, 102, 241, 0.8)", // Indigo
    "rgba(14, 165, 233, 0.8)", // Sky
    "rgba(168, 85, 247, 0.8)", // Violet
    "rgba(34, 197, 94, 0.8)", // Emerald
  ],

  // Default chart options
  DEFAULTS: {
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: false,
    BORDER_RADIUS: 8,
    ANIMATION_DURATION: 750,
  },

  // Sparkline configuration
  SPARKLINE: {
    WIDTH: 80,
    HEIGHT: 24,
    STROKE_WIDTH: 2,
    SHOW_FILL: true,
  },
} as const;

// ============================================================================
// Export Configuration
// ============================================================================

export const EXPORT_CONFIG = {
  OPTIONS: [
    { type: "sales_summary", label: "Sales Summary" },
    { type: "orders", label: "All Orders" },
    { type: "customers", label: "All Customers" },
    { type: "products", label: "All Products" },
  ],

  FILE_FORMATS: {
    CSV: "csv",
    JSON: "json",
    XLSX: "xlsx",
  },
} as const;

// ============================================================================
// Pagination Configuration
// ============================================================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5,
} as const;

// ============================================================================
// Toast Notification Configuration
// ============================================================================

export const TOAST_CONFIG = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 7000,
  },

  POSITION: {
    TOP_LEFT: "top-left",
    TOP_CENTER: "top-center",
    TOP_RIGHT: "top-right",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_CENTER: "bottom-center",
    BOTTOM_RIGHT: "bottom-right",
  },

  DEFAULT_POSITION: "bottom-right",
  DEFAULT_DURATION: 5000,
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_BACKOFF: 2, // Exponential backoff multiplier
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  THEME: "dashboard_theme",
  DATE_RANGE: "dashboard_date_range",
  COMPARE_TYPE: "dashboard_compare_type",
  AUTO_REFRESH: "dashboard_auto_refresh",
  SIDEBAR_COLLAPSED: "dashboard_sidebar_collapsed",
  TABLE_PREFERENCES: "dashboard_table_preferences",
  RECENT_SEARCHES: "dashboard_recent_searches",
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_EXPORT: true,
  ENABLE_AUTO_REFRESH: true,
  ENABLE_KEYBOARD_SHORTCUTS: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_FORECASTING: true,
  ENABLE_SEGMENTATION: true,
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION = {
  URL: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 255,
    PATTERN: /^https?:\/\/.+/,
  },

  API_KEY: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 100,
  },

  DATE_RANGE: {
    MIN_DAYS: 1,
    MAX_DAYS: 365,
  },

  SEARCH: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    DEBOUNCE_MS: 300,
  },
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI_CONSTANTS = {
  // Breakpoints (matching Tailwind defaults)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
  },

  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 40,
    STICKY: 45,
    MODAL_BACKDROP: 50,
    MODAL: 50,
    POPOVER: 60,
    TOOLTIP: 70,
  },

  // Transition durations (ms)
  TRANSITIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT: "Request timed out. Please try again.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
  VALIDATION: "Please check your input and try again.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  DATA_REFRESHED: "Data refreshed successfully",
  EXPORT_COMPLETE: "Export completed successfully",
  SETTINGS_SAVED: "Settings saved successfully",
  CACHE_CLEARED: "Cache cleared successfully",
} as const;
