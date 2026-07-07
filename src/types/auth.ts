/* ============================================================
 * Types — Authentication & Roles
 * ============================================================ */

/** The three roles in the Mini ERP system */
export type Role = "Admin" | "Manager" | "Employee";

/** Authenticated user shape */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

/** Auth context state */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
