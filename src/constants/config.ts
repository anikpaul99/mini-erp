/* ============================================================
 * Constants — Application Configuration
 * ============================================================
 * Single source of truth for app-wide configuration values.
 * ============================================================ */

export const APP_CONFIG = {
  /** Display name shown in the UI and metadata */
  name: "Mini ERP",

  /** Public-facing URL of this web app */
  url: import.meta.env.VITE_APP_URL || "http://localhost:3000",

  /** Backend API base URL */
  apiBaseUrl:
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5000/api/v1",

  /** Default pagination settings */
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    limitOptions: [10, 25, 50],
  },

  /** Currency symbol used across the app */
  currency: "$",
} as const;
