/* ============================================================
 * API - Products
 * ============================================================ */

import { APP_CONFIG } from "@/constants/config";
import type { ApiResponse } from "@/types/api";

export interface ApiProduct {
  _id: string;
  productName: string;
  productImg?: string;
  img?: string;
  sku: string;
  actualPrice: number;
  sellingPrice: number;
  inStock: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface TopSellingProduct {
  soldQuantity: number;
  revenue: number;
  profit: number;
  productId: string;
  productName: string;
  sku: string;
}

export interface ProductAnalytics {
  overview: {
    totalProducts: number;
    totalStockAvailable: number;
    totalProductsSold: number;
    totalRevenue: number;
    totalProfit: number;
  };
  lowStockProducts: ApiProduct[];
  topSellingProducts: TopSellingProduct[];
}

export interface ProductFormPayload {
  productName: string;
  sku: string;
  actualPrice: number;
  sellingPrice: number;
  inStock: number;
  img?: File | null;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: FormData;
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

function buildProductFormData(payload: ProductFormPayload) {
  const formData = new FormData();
  formData.append("productName", payload.productName);
  formData.append("sku", payload.sku);
  formData.append("actualPrice", String(payload.actualPrice));
  formData.append("sellingPrice", String(payload.sellingPrice));
  formData.append("inStock", String(payload.inStock));

  if (payload.img) {
    formData.append("img", payload.img);
  }

  return formData;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers: buildAuthHeaders(),
    body: options.body,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || "Request failed");
  }

  return payload.data;
}

export function getAllProducts(): Promise<ApiProduct[]> {
  return apiRequest<ApiProduct[]>("/products/getAllProducts");
}

export function getProductAnalytics(): Promise<ProductAnalytics> {
  return apiRequest<ProductAnalytics>("/products/getAnalytics");
}

export function createProduct(payload: ProductFormPayload): Promise<ApiProduct> {
  return apiRequest<ApiProduct>("/products/createProduct", {
    method: "POST",
    body: buildProductFormData(payload),
  });
}

export function updateProduct({
  id,
  payload,
}: {
  id: string;
  payload: ProductFormPayload;
}): Promise<ApiProduct> {
  return apiRequest<ApiProduct>(`/products/updateProduct/${id}`, {
    method: "PATCH",
    body: buildProductFormData(payload),
  });
}

export function toggleDeleteProduct(id: string): Promise<ApiProduct> {
  return apiRequest<ApiProduct>(`/products/toggleDeleteProduct/${id}`, {
    method: "PATCH",
  });
}
