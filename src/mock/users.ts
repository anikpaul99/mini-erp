/* ============================================================
 * Mock Data — System Users (5 users, all 3 roles)
 * ============================================================ */

import type { SystemUser } from "@/types/user";
import type { AuthUser } from "@/types/auth";

export const MOCK_USERS: SystemUser[] = [
  { id: "usr-01", name: "Alex Morgan", email: "alex.morgan@minierp.com", role: "Admin", status: "Active", dateJoined: "2026-01-15T09:00:00Z" },
  { id: "usr-02", name: "Jordan Lee", email: "jordan.lee@minierp.com", role: "Manager", status: "Active", dateJoined: "2026-02-01T10:00:00Z" },
  { id: "usr-03", name: "Casey Taylor", email: "casey.taylor@minierp.com", role: "Employee", status: "Active", dateJoined: "2026-02-20T08:30:00Z" },
  { id: "usr-04", name: "Riley Brooks", email: "riley.brooks@minierp.com", role: "Employee", status: "Active", dateJoined: "2026-03-10T11:00:00Z" },
  { id: "usr-05", name: "Sam Cooper", email: "sam.cooper@minierp.com", role: "Manager", status: "Inactive", dateJoined: "2026-01-20T09:00:00Z" },
];

/**
 * Pre-built auth user profiles for the role switcher.
 */
export const MOCK_AUTH_USERS: Record<string, AuthUser> = {
  Admin: {
    id: "usr-01",
    name: "Alex Morgan",
    email: "alex.morgan@minierp.com",
    role: "Admin",
  },
  Manager: {
    id: "usr-02",
    name: "Jordan Lee",
    email: "jordan.lee@minierp.com",
    role: "Manager",
  },
  Employee: {
    id: "usr-03",
    name: "Casey Taylor",
    email: "casey.taylor@minierp.com",
    role: "Employee",
  },
};
