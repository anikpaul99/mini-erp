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
  phone?: string;
  avatar?: string;
}

/** Auth context state */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export interface AuthRole {
  _id: string;
  name: Role;
}

export interface AuthPermission {
  _id: string;
  code: string;
  module: string;
  name: string;
}

export interface AuthPermissionBlueprint {
  _id: string;
  name: string;
  permissionIds: AuthPermission[];
}

export interface AuthApiUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  roleId: AuthRole;
  permissionBlueprintId?: AuthPermissionBlueprint;
  blockedPermissionIds?: AuthPermission[];
  img?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: AuthApiUser;
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
