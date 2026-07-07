/* ============================================================
 * Constants — Navigation Items
 * ============================================================
 * Sidebar nav definitions with role-based filtering.
 * Items are filtered by the current user's role — items
 * that the role can't access never render (absence, not disablement).
 * ============================================================ */

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  UserCog,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";
import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles that can see this item. If empty/undefined, visible to all. */
  roles?: Role[];
  /** Child items for expandable nav groups */
  children?: NavItem[];
}

/**
 * Primary sidebar navigation items per Design Bible §3.2.
 * Order: Dashboard, Products, Sales (expandable), Customers,
 *        divider, Users (Admin), Roles & Permissions (Admin).
 */
export const SIDEBAR_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["Admin", "Manager"],
  },
  {
    label: "Products",
    href: ROUTES.PRODUCTS,
    icon: Package,
  },
  {
    label: "Sales",
    href: ROUTES.SALES_CREATE,
    icon: ShoppingCart,
    children: [
      {
        label: "Create Sale",
        href: ROUTES.SALES_CREATE,
        icon: ShoppingCart,
      },
      {
        label: "Sales History",
        href: ROUTES.SALES_HISTORY,
        icon: Receipt,
        roles: ["Admin", "Manager"],
      },
    ],
  },
  {
    label: "Customers",
    href: ROUTES.CUSTOMERS,
    icon: Users,
    roles: ["Admin", "Manager"],
  },
];

/**
 * Admin-only nav items that appear below the divider.
 */
export const SIDEBAR_ADMIN_NAV: NavItem[] = [
  {
    label: "Users",
    href: ROUTES.USERS,
    icon: UserCog,
    roles: ["Admin"],
  },
  {
    label: "Roles & Permissions",
    href: ROUTES.ROLES,
    icon: ShieldCheck,
    roles: ["Admin"],
  },
];
