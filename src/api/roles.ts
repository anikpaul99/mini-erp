/* ============================================================
 * API - Roles & Permissions
 * ============================================================ */

import { APP_CONFIG } from "@/constants/config";
import type { ApiResponse } from "@/types/api";

export interface ApiRole {
  _id: string;
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ApiPermission {
  _id: string;
  name: string;
  code: string;
  module?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ApiRolePermissionBlueprint {
  _id: string;
  name: string;
  roleId: ApiRole;
  permissionIds: ApiPermission[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface RolePermissionBlueprintPayload {
  name: string;
  roleId: string;
  permissionIds: string[];
}

export type BlueprintPermissionAction = "add" | "remove";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

type StoredAuthSession = {
  accessToken?: string;
  refreshToken?: string;
};

function getStoredAuthSession(): StoredAuthSession {
  if (typeof window === "undefined") return {};

  const accessToken = window.localStorage.getItem("accessToken") || undefined;
  const refreshToken = window.localStorage.getItem("refreshToken") || undefined;
  const rawSession = window.localStorage.getItem("mini_erp_auth");

  if (!rawSession) {
    return { accessToken, refreshToken };
  }

  try {
    const session = JSON.parse(rawSession) as StoredAuthSession;
    return {
      accessToken: accessToken || session.accessToken,
      refreshToken: refreshToken || session.refreshToken,
    };
  } catch {
    return { accessToken, refreshToken };
  }
}

function toBearerToken(token?: string) {
  if (!token) return undefined;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function buildAuthHeaders(): Record<string, string> {
  const session = getStoredAuthSession();
  const authorization = toBearerToken(session.accessToken);
  const headers: Record<string, string> = {};

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (session.refreshToken) {
    headers["x-refresh-token"] = session.refreshToken;
  }

  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...buildAuthHeaders(),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || "Request failed");
  }

  return payload.data;
}

export function getAllRoles(): Promise<ApiRole[]> {
  return apiRequest<ApiRole[]>("/roles/getAllRoles");
}

export function createRole(name: string): Promise<ApiRole> {
  return apiRequest<ApiRole>("/roles/createRole", {
    method: "POST",
    body: { name },
  });
}

export function updateRole(id: string, name: string): Promise<ApiRole> {
  return apiRequest<ApiRole>(`/roles/updateRole/${id}`, {
    method: "PATCH",
    body: { name },
  });
}

export function toggleDeleteRole(id: string): Promise<ApiRole> {
  return apiRequest<ApiRole>(`/roles/toggleDeleteRole/${id}`, {
    method: "DELETE",
  });
}

export function getAllPermissions(): Promise<ApiPermission[]> {
  return apiRequest<ApiPermission[]>("/permissions/getAllPermissions");
}

export function getAllRolePermissionBlueprints(): Promise<
  ApiRolePermissionBlueprint[]
> {
  return apiRequest<ApiRolePermissionBlueprint[]>(
    "/role-permissions-blueprint/getAllRolePermissionBlueprints"
  );
}

export function createRolePermissionBlueprint(
  payload: RolePermissionBlueprintPayload
): Promise<ApiRolePermissionBlueprint> {
  return apiRequest<ApiRolePermissionBlueprint>(
    "/role-permissions-blueprint/createRolePermissionBlueprint",
    {
      method: "POST",
      body: payload,
    }
  );
}

export function updateBlueprintPermission({
  blueprintId,
  permissionId,
  action,
}: {
  blueprintId: string;
  permissionId: string;
  action: BlueprintPermissionAction;
}): Promise<ApiRolePermissionBlueprint> {
  return apiRequest<ApiRolePermissionBlueprint>(
    `/role-permissions-blueprint/updateBlueprintPermission/${blueprintId}`,
    {
      method: "PATCH",
      body: { permissionId, action },
    }
  );
}
