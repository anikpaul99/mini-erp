/* ============================================================
 * Constants — Role Permissions
 * ============================================================
 * Role → Route access map from Design Bible §8.
 * Used by ProtectedRoute and sidebar filtering.
 * ============================================================ */

import type { Role } from "@/types/auth";
import { ROUTES } from "./routes";

/**
 * Routes each role can access.
 * If a route is not listed for a role, navigating to it
 * redirects to their home page or shows 403.
 */
export const ROLE_ROUTE_ACCESS: Record<Role, string[]> = {
  Admin: [
    ROUTES.DASHBOARD,
    ROUTES.PRODUCTS,
    ROUTES.SALES_CREATE,
    ROUTES.SALES_HISTORY,
    ROUTES.CUSTOMERS,
    ROUTES.USERS,
    ROUTES.ROLES,
    ROUTES.ACCOUNT,
  ],
  Manager: [
    ROUTES.DASHBOARD,
    ROUTES.PRODUCTS,
    ROUTES.SALES_CREATE,
    ROUTES.SALES_HISTORY,
    ROUTES.CUSTOMERS,
    ROUTES.ACCOUNT,
  ],
  Employee: [
    ROUTES.PRODUCTS,
    ROUTES.SALES_CREATE,
    ROUTES.ACCOUNT,
  ],
};

/**
 * The default landing route for each role after login.
 * Admin/Manager → /dashboard, Employee → /sales/create.
 */
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  Admin: ROUTES.DASHBOARD,
  Manager: ROUTES.DASHBOARD,
  Employee: ROUTES.SALES_CREATE,
};

/**
 * Permission capabilities for the Roles & Permissions matrix (§5.20).
 * Each capability maps to which roles have it enabled by default.
 */
export interface PermissionCapability {
  id: string;
  label: string;
  category: string;
  defaults: Record<Role, boolean>;
}

export const PERMISSION_CAPABILITIES: PermissionCapability[] = [
  // Dashboard
  { id: "view_dashboard", label: "View Dashboard", category: "Dashboard", defaults: { Admin: true, Manager: true, Employee: false } },

  // Products
  { id: "view_products", label: "View Products", category: "Products", defaults: { Admin: true, Manager: true, Employee: true } },
  { id: "add_products", label: "Add Products", category: "Products", defaults: { Admin: true, Manager: true, Employee: false } },
  { id: "edit_products", label: "Edit Products", category: "Products", defaults: { Admin: true, Manager: true, Employee: false } },
  { id: "delete_products", label: "Delete Products", category: "Products", defaults: { Admin: true, Manager: true, Employee: false } },

  // Sales
  { id: "create_sale", label: "Create Sale", category: "Sales", defaults: { Admin: true, Manager: true, Employee: true } },
  { id: "view_sales_history", label: "View Sales History", category: "Sales", defaults: { Admin: true, Manager: true, Employee: false } },
  { id: "view_sale_detail", label: "View Sale Detail", category: "Sales", defaults: { Admin: true, Manager: true, Employee: false } },

  // Customers
  { id: "view_customers", label: "View Customers", category: "Customers", defaults: { Admin: true, Manager: true, Employee: false } },
  { id: "add_customers", label: "Add Customers", category: "Customers", defaults: { Admin: true, Manager: true, Employee: false } },
  { id: "edit_customers", label: "Edit Customers", category: "Customers", defaults: { Admin: true, Manager: true, Employee: false } },
  { id: "delete_customers", label: "Delete Customers", category: "Customers", defaults: { Admin: true, Manager: true, Employee: false } },

  // Users
  { id: "view_users", label: "View Users", category: "Users", defaults: { Admin: true, Manager: false, Employee: false } },
  { id: "add_users", label: "Add Users", category: "Users", defaults: { Admin: true, Manager: false, Employee: false } },
  { id: "edit_users", label: "Edit Users", category: "Users", defaults: { Admin: true, Manager: false, Employee: false } },
  { id: "deactivate_users", label: "Deactivate Users", category: "Users", defaults: { Admin: true, Manager: false, Employee: false } },

  // Roles & Permissions
  { id: "manage_roles", label: "Manage Roles & Permissions", category: "System", defaults: { Admin: true, Manager: false, Employee: false } },
];
