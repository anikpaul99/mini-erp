/* ============================================================
 * API - Sales
 * ============================================================ */

import { APP_CONFIG } from "@/constants/config";
import type { ApiResponse } from "@/types/api";
import type { ApiProduct } from "@/api/products";
import type { ApiUser } from "@/api/users";

export interface CreateSalePayload {
  customerId: string;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export interface ApiSaleItem {
  itemId: ApiProduct;
  quantity: number;
  actualPrice: number;
  sellingPrice: number;
  totalPriceForThisItem: number;
  profitAmount: number;
  _id: string;
}

export interface ApiSale {
  _id: string;
  salesmanId: ApiUser;
  customerId: ApiUser;
  items: ApiSaleItem[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SalesmanAnalyticsSale {
  _id: string;
  createdAt: string;
  salesman: {
    _id: string;
    name: string;
    email: string;
  };
  customer: {
    _id: string;
    name: string;
  };
  saleId: string;
  totalItems: number;
  revenue: number;
  profit: number;
}

export interface SalesmanAnalytics {
  salesman: {
    _id: string;
    name: string;
    email: string;
  };
  summary: {
    totalSales: number;
    totalItemsSold: number;
    totalRevenue: number;
    totalProfit: number;
  };
  sales: SalesmanAnalyticsSale[];
}

type RequestOptions = {
  method?: "GET" | "POST";
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

export function createSale(payload: CreateSalePayload): Promise<ApiSale> {
  return apiRequest<ApiSale>("/sells/createSale", {
    method: "POST",
    body: payload,
  });
}

export function getSalesmanAnalytics(): Promise<SalesmanAnalytics> {
  return apiRequest<SalesmanAnalytics>("/sells/getSalesmanAnalytics");
}
