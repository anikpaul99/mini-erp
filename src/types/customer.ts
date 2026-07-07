/* ============================================================
 * Types — Customers
 * ============================================================ */

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalPurchases: number;
  createdAt: string;
}
