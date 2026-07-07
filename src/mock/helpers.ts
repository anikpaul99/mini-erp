/* ============================================================
 * Mock Data — API Helpers
 * ============================================================ */

import type { ApiResponse } from "@/types/api";

/**
 * Wrap data in the standard API response envelope.
 * When the real backend is wired, only the data-fetching
 * hooks change — components still consume this shape.
 */
export function mockSuccess<T>(data: T, message = "Success"): ApiResponse<T> {
  return { success: true, message, data };
}

export function mockError<T>(error: string, data: T): ApiResponse<T> {
  return { success: false, message: error, data, error };
}

/**
 * Simulate a network delay (400–600ms) for loading states.
 */
export function simulateDelay(ms?: number): Promise<void> {
  const delay = ms ?? 400 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Generate a sequential display ID.
 */
export function generateDisplayId(prefix: string, index: number): string {
  return `#${prefix}-${String(index).padStart(5, "0")}`;
}

/**
 * Generate a random ID string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
