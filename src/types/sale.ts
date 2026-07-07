/* ============================================================
 * Types — Sales
 * ============================================================ */

export interface SaleLineItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  /** Display ID like #S-00142 */
  displayId: string;
  customerId?: string;
  customerName?: string;
  lineItems: SaleLineItem[];
  grandTotal: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}
