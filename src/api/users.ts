/* ============================================================
 * API - Users
 * ============================================================ */

import { APP_CONFIG } from "@/constants/config";
import type { ApiResponse } from "@/types/api";
import type { ApiPermission, ApiRole } from "@/api/roles";

export interface ApiUserPermissionBlueprint {
  _id: string;
  name: string;
  roleId?: string | ApiRole;
  permissionIds: ApiPermission[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roleId: ApiRole;
  permissionBlueprintId: ApiUserPermissionBlueprint | null;
  blockedPermissionIds: ApiPermission[];
  img?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  phone: string;
  roleId: string;
}

export interface GetUsersParams {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
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
  const headers: Record<string, string> = {};
  const authorization = toBearerToken(session.accessToken);

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (session.refreshToken) {
    headers["x-refresh-token"] = session.refreshToken;
  }

  return headers;
}

function buildQuery(params?: GetUsersParams) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
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

export function getAllUsers(params?: GetUsersParams): Promise<ApiUser[]> {
  return apiRequest<ApiUser[]>(`/users/getAllUsers${buildQuery(params)}`);
}

export function createUser(payload: CreateUserPayload): Promise<ApiUser> {
  return apiRequest<ApiUser>("/users/createUser", {
    method: "POST",
    body: payload,
  });
}

export function createCustomer(
  payload: CreateCustomerPayload
): Promise<ApiUser> {
  return apiRequest<ApiUser>("/users/createCustomer", {
    method: "POST",
    body: payload,
  });
}

export function updateUser({
  id,
  payload,
}: {
  id: string;
  payload: UpdateUserPayload;
}): Promise<ApiUser> {
  return apiRequest<ApiUser>(`/users/updateUser/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function togglePermissionDeletion({
  userId,
  permissionId,
}: {
  userId: string;
  permissionId: string;
}): Promise<ApiUser> {
  return apiRequest<ApiUser>(`/users/togglePermissionDeletion/${userId}`, {
    method: "PATCH",
    body: { permissionId },
  });
}
