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

  /** Default pagination settings */
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    limitOptions: [10, 25, 50],
  },

  /** Currency symbol used across the app */
  currency: "$",
} as const;
