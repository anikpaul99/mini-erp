/* ============================================================
 * Types — Products
 * ============================================================ */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

/** Derive stock status from quantity */
export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out_of_stock";
  if (stock < 5) return "low_stock";
  return "in_stock";
}

/** Get human-readable stock label */
export function getStockLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
  }
}
