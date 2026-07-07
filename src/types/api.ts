/* ============================================================
 * Types — API Response Envelope
 * ============================================================ */

/**
 * Standard API response shape. Mock data is wrapped in this
 * envelope so swapping to real API calls later only touches
 * the data-fetching layer, never the component.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}
