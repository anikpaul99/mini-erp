/* ============================================================
 * Constants — Route Definitions
 * ============================================================
 * All Mini ERP route paths. Import from here instead of
 * scattering string literals across the codebase.
 * ============================================================ */

export const ROUTES = {
  // ----- Public -----
  HOME: "/",
  LOGIN: "/login",

  // ----- Dashboard -----
  DASHBOARD: "/dashboard",

  // ----- Products -----
  PRODUCTS: "/products",

  // ----- Sales -----
  SALES_CREATE: "/sales/create",
  SALES_HISTORY: "/sales/history",

  // ----- Customers -----
  CUSTOMERS: "/customers",

  // ----- Users (Admin) -----
  USERS: "/users",

  // ----- Roles & Permissions (Admin) -----
  ROLES: "/roles",

  // ----- Account -----
  ACCOUNT: "/account",

  // ----- Error Pages -----
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
} as const;

/**
 * Public routes that don't require authentication.
 */
export const PUBLIC_ROUTES: string[] = [ROUTES.HOME, ROUTES.LOGIN];
