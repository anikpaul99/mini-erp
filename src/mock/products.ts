/* ============================================================
 * Mock Data — Products (~50 products)
 * ============================================================
 * Realistic product names/SKUs/categories with a mix of
 * in-stock, low-stock (<5), and out-of-stock items.
 * ============================================================ */

import type { Product } from "@/types/product";
import { MOCK_CATEGORIES } from "./categories";

const cat = (name: string) => MOCK_CATEGORIES.find((c) => c.name === name)!;

export const MOCK_PRODUCTS: Product[] = [
  // ── Electronics (10) ─────────────────────────
  { id: "p-001", name: "Wireless Bluetooth Headphones", sku: "EL-WBH-001", category: cat("Electronics"), purchasePrice: 28.50, sellingPrice: 49.99, stock: 34, image: "", createdAt: "2026-03-12T10:30:00Z", updatedAt: "2026-06-28T14:20:00Z" },
  { id: "p-002", name: "USB-C Charging Cable (2m)", sku: "EL-UCC-002", category: cat("Electronics"), purchasePrice: 3.20, sellingPrice: 8.99, stock: 120, image: "", createdAt: "2026-03-12T10:31:00Z", updatedAt: "2026-06-20T09:15:00Z" },
  { id: "p-003", name: "Portable Power Bank 10000mAh", sku: "EL-PPB-003", category: cat("Electronics"), purchasePrice: 14.00, sellingPrice: 29.99, stock: 3, image: "", createdAt: "2026-03-15T08:00:00Z", updatedAt: "2026-07-01T11:45:00Z" },
  { id: "p-004", name: "Wireless Mouse — Ergonomic", sku: "EL-WME-004", category: cat("Electronics"), purchasePrice: 12.75, sellingPrice: 24.99, stock: 0, image: "", createdAt: "2026-03-18T14:00:00Z", updatedAt: "2026-07-02T16:30:00Z" },
  { id: "p-005", name: "LED Desk Lamp with Dimmer", sku: "EL-LDL-005", category: cat("Electronics"), purchasePrice: 18.00, sellingPrice: 34.99, stock: 22, image: "", createdAt: "2026-03-20T09:00:00Z", updatedAt: "2026-06-25T10:00:00Z" },
  { id: "p-006", name: "Mechanical Keyboard TKL", sku: "EL-MKT-006", category: cat("Electronics"), purchasePrice: 35.00, sellingPrice: 64.99, stock: 15, image: "", createdAt: "2026-03-22T11:00:00Z", updatedAt: "2026-06-30T08:00:00Z" },
  { id: "p-007", name: "Webcam HD 1080p", sku: "EL-WHD-007", category: cat("Electronics"), purchasePrice: 22.00, sellingPrice: 42.99, stock: 2, image: "", createdAt: "2026-04-01T08:30:00Z", updatedAt: "2026-07-03T14:00:00Z" },
  { id: "p-008", name: "USB Hub 7-Port", sku: "EL-UH7-008", category: cat("Electronics"), purchasePrice: 9.50, sellingPrice: 19.99, stock: 45, image: "", createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-06-18T12:00:00Z" },
  { id: "p-009", name: "Noise Cancelling Earbuds", sku: "EL-NCE-009", category: cat("Electronics"), purchasePrice: 42.00, sellingPrice: 79.99, stock: 8, image: "", createdAt: "2026-04-10T09:00:00Z", updatedAt: "2026-07-04T15:30:00Z" },
  { id: "p-010", name: "Smart Plug Wi-Fi", sku: "EL-SPW-010", category: cat("Electronics"), purchasePrice: 7.00, sellingPrice: 14.99, stock: 60, image: "", createdAt: "2026-04-12T11:30:00Z", updatedAt: "2026-06-22T09:00:00Z" },

  // ── Groceries (10) ─────────────────────────
  { id: "p-011", name: "Organic Green Tea (100 bags)", sku: "GR-OGT-011", category: cat("Groceries"), purchasePrice: 4.50, sellingPrice: 9.99, stock: 85, image: "", createdAt: "2026-03-14T08:00:00Z", updatedAt: "2026-06-30T10:00:00Z" },
  { id: "p-012", name: "Extra Virgin Olive Oil 500ml", sku: "GR-EVO-012", category: cat("Groceries"), purchasePrice: 6.80, sellingPrice: 12.49, stock: 40, image: "", createdAt: "2026-03-14T08:30:00Z", updatedAt: "2026-06-28T11:00:00Z" },
  { id: "p-013", name: "Raw Honey Jar 350g", sku: "GR-RHJ-013", category: cat("Groceries"), purchasePrice: 5.20, sellingPrice: 11.99, stock: 4, image: "", createdAt: "2026-03-16T09:00:00Z", updatedAt: "2026-07-01T14:00:00Z" },
  { id: "p-014", name: "Quinoa Grain 1kg", sku: "GR-QG1-014", category: cat("Groceries"), purchasePrice: 3.80, sellingPrice: 7.99, stock: 55, image: "", createdAt: "2026-03-18T10:00:00Z", updatedAt: "2026-06-26T08:30:00Z" },
  { id: "p-015", name: "Dark Chocolate Bar 85%", sku: "GR-DCB-015", category: cat("Groceries"), purchasePrice: 2.10, sellingPrice: 4.99, stock: 0, image: "", createdAt: "2026-03-20T07:00:00Z", updatedAt: "2026-07-02T09:00:00Z" },
  { id: "p-016", name: "Almond Butter 250g", sku: "GR-AB2-016", category: cat("Groceries"), purchasePrice: 4.00, sellingPrice: 8.49, stock: 28, image: "", createdAt: "2026-04-02T08:00:00Z", updatedAt: "2026-06-29T10:30:00Z" },
  { id: "p-017", name: "Coconut Milk Can 400ml", sku: "GR-CMC-017", category: cat("Groceries"), purchasePrice: 1.50, sellingPrice: 3.49, stock: 95, image: "", createdAt: "2026-04-05T09:30:00Z", updatedAt: "2026-06-20T14:00:00Z" },
  { id: "p-018", name: "Jasmine Rice 5kg", sku: "GR-JR5-018", category: cat("Groceries"), purchasePrice: 8.00, sellingPrice: 14.99, stock: 1, image: "", createdAt: "2026-04-08T10:00:00Z", updatedAt: "2026-07-04T08:00:00Z" },
  { id: "p-019", name: "Organic Pasta 500g", sku: "GR-OP5-019", category: cat("Groceries"), purchasePrice: 1.80, sellingPrice: 3.99, stock: 72, image: "", createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-06-27T11:00:00Z" },
  { id: "p-020", name: "Mixed Nuts Trail Pack", sku: "GR-MNT-020", category: cat("Groceries"), purchasePrice: 3.50, sellingPrice: 6.99, stock: 18, image: "", createdAt: "2026-04-12T09:00:00Z", updatedAt: "2026-07-01T08:00:00Z" },

  // ── Apparel (8) ─────────────────────────
  { id: "p-021", name: "Classic Crew Neck T-Shirt", sku: "AP-CNT-021", category: cat("Apparel"), purchasePrice: 5.50, sellingPrice: 14.99, stock: 50, image: "", createdAt: "2026-03-25T10:00:00Z", updatedAt: "2026-06-28T13:00:00Z" },
  { id: "p-022", name: "Slim Fit Chinos — Navy", sku: "AP-SFC-022", category: cat("Apparel"), purchasePrice: 12.00, sellingPrice: 29.99, stock: 3, image: "", createdAt: "2026-03-25T10:30:00Z", updatedAt: "2026-07-03T10:00:00Z" },
  { id: "p-023", name: "Lightweight Rain Jacket", sku: "AP-LRJ-023", category: cat("Apparel"), purchasePrice: 18.00, sellingPrice: 39.99, stock: 12, image: "", createdAt: "2026-04-01T09:00:00Z", updatedAt: "2026-06-25T14:00:00Z" },
  { id: "p-024", name: "Cotton Socks (3-pack)", sku: "AP-CS3-024", category: cat("Apparel"), purchasePrice: 3.00, sellingPrice: 7.99, stock: 0, image: "", createdAt: "2026-04-03T08:00:00Z", updatedAt: "2026-07-01T16:00:00Z" },
  { id: "p-025", name: "Denim Jacket — Washed Blue", sku: "AP-DJW-025", category: cat("Apparel"), purchasePrice: 22.00, sellingPrice: 49.99, stock: 7, image: "", createdAt: "2026-04-08T11:00:00Z", updatedAt: "2026-06-30T12:00:00Z" },
  { id: "p-026", name: "Performance Running Shorts", sku: "AP-PRS-026", category: cat("Apparel"), purchasePrice: 8.00, sellingPrice: 19.99, stock: 25, image: "", createdAt: "2026-04-10T10:00:00Z", updatedAt: "2026-06-27T09:00:00Z" },
  { id: "p-027", name: "Wool Blend Beanie", sku: "AP-WBB-027", category: cat("Apparel"), purchasePrice: 4.50, sellingPrice: 12.99, stock: 38, image: "", createdAt: "2026-04-15T08:30:00Z", updatedAt: "2026-06-24T11:00:00Z" },
  { id: "p-028", name: "Linen Button-Down Shirt", sku: "AP-LBS-028", category: cat("Apparel"), purchasePrice: 14.00, sellingPrice: 34.99, stock: 2, image: "", createdAt: "2026-04-18T09:00:00Z", updatedAt: "2026-07-04T10:00:00Z" },

  // ── Stationery (8) ─────────────────────────
  { id: "p-029", name: "A5 Hardcover Notebook", sku: "ST-A5H-029", category: cat("Stationery"), purchasePrice: 2.50, sellingPrice: 6.99, stock: 90, image: "", createdAt: "2026-03-20T08:00:00Z", updatedAt: "2026-06-28T09:00:00Z" },
  { id: "p-030", name: "Gel Pen Set (12 Colors)", sku: "ST-GP1-030", category: cat("Stationery"), purchasePrice: 3.00, sellingPrice: 7.49, stock: 65, image: "", createdAt: "2026-03-22T09:00:00Z", updatedAt: "2026-06-26T10:00:00Z" },
  { id: "p-031", name: "Desk Organizer — Bamboo", sku: "ST-DOB-031", category: cat("Stationery"), purchasePrice: 8.50, sellingPrice: 18.99, stock: 4, image: "", createdAt: "2026-04-01T10:00:00Z", updatedAt: "2026-07-02T14:00:00Z" },
  { id: "p-032", name: "Sticky Notes Neon Pack", sku: "ST-SNN-032", category: cat("Stationery"), purchasePrice: 1.20, sellingPrice: 3.49, stock: 150, image: "", createdAt: "2026-04-05T08:30:00Z", updatedAt: "2026-06-22T11:00:00Z" },
  { id: "p-033", name: "Mechanical Pencil 0.5mm", sku: "ST-MP5-033", category: cat("Stationery"), purchasePrice: 1.80, sellingPrice: 4.99, stock: 0, image: "", createdAt: "2026-04-08T09:00:00Z", updatedAt: "2026-07-03T08:00:00Z" },
  { id: "p-034", name: "Document Folder A4 (5-pack)", sku: "ST-DFA-034", category: cat("Stationery"), purchasePrice: 2.00, sellingPrice: 5.49, stock: 42, image: "", createdAt: "2026-04-12T10:00:00Z", updatedAt: "2026-06-29T09:00:00Z" },
  { id: "p-035", name: "Whiteboard Markers (4-pack)", sku: "ST-WBM-035", category: cat("Stationery"), purchasePrice: 2.80, sellingPrice: 6.99, stock: 55, image: "", createdAt: "2026-04-15T08:00:00Z", updatedAt: "2026-06-25T12:00:00Z" },
  { id: "p-036", name: "Paper Clips Box (100pc)", sku: "ST-PCB-036", category: cat("Stationery"), purchasePrice: 0.80, sellingPrice: 2.49, stock: 200, image: "", createdAt: "2026-04-18T09:30:00Z", updatedAt: "2026-06-20T08:00:00Z" },

  // ── Home & Living (8) ─────────────────────────
  { id: "p-037", name: "Scented Soy Candle — Vanilla", sku: "HL-SSC-037", category: cat("Home & Living"), purchasePrice: 5.00, sellingPrice: 12.99, stock: 30, image: "", createdAt: "2026-03-28T10:00:00Z", updatedAt: "2026-06-30T11:00:00Z" },
  { id: "p-038", name: "Microfiber Bath Towel Set", sku: "HL-MBT-038", category: cat("Home & Living"), purchasePrice: 10.00, sellingPrice: 22.99, stock: 1, image: "", createdAt: "2026-04-02T08:00:00Z", updatedAt: "2026-07-04T09:00:00Z" },
  { id: "p-039", name: "Ceramic Plant Pot — Medium", sku: "HL-CPP-039", category: cat("Home & Living"), purchasePrice: 4.50, sellingPrice: 11.99, stock: 20, image: "", createdAt: "2026-04-05T10:30:00Z", updatedAt: "2026-06-28T08:00:00Z" },
  { id: "p-040", name: "Bamboo Cutting Board", sku: "HL-BCB-040", category: cat("Home & Living"), purchasePrice: 6.00, sellingPrice: 14.99, stock: 0, image: "", createdAt: "2026-04-08T09:00:00Z", updatedAt: "2026-07-01T12:00:00Z" },
  { id: "p-041", name: "Cotton Throw Blanket", sku: "HL-CTB-041", category: cat("Home & Living"), purchasePrice: 12.00, sellingPrice: 27.99, stock: 14, image: "", createdAt: "2026-04-12T10:00:00Z", updatedAt: "2026-06-26T14:00:00Z" },
  { id: "p-042", name: "Stainless Steel Water Bottle", sku: "HL-SSW-042", category: cat("Home & Living"), purchasePrice: 7.50, sellingPrice: 16.99, stock: 35, image: "", createdAt: "2026-04-15T09:00:00Z", updatedAt: "2026-06-24T10:00:00Z" },
  { id: "p-043", name: "Linen Cushion Cover 45cm", sku: "HL-LCC-043", category: cat("Home & Living"), purchasePrice: 4.00, sellingPrice: 9.99, stock: 48, image: "", createdAt: "2026-04-18T11:00:00Z", updatedAt: "2026-06-22T08:00:00Z" },
  { id: "p-044", name: "Glass Storage Jar Set", sku: "HL-GSJ-044", category: cat("Home & Living"), purchasePrice: 8.00, sellingPrice: 17.99, stock: 3, image: "", createdAt: "2026-04-20T08:30:00Z", updatedAt: "2026-07-03T11:00:00Z" },

  // ── Sports (6) ─────────────────────────
  { id: "p-045", name: "Yoga Mat 6mm — Purple", sku: "SP-YM6-045", category: cat("Sports"), purchasePrice: 10.00, sellingPrice: 24.99, stock: 18, image: "", createdAt: "2026-04-01T08:00:00Z", updatedAt: "2026-06-30T09:00:00Z" },
  { id: "p-046", name: "Resistance Bands Set", sku: "SP-RBS-046", category: cat("Sports"), purchasePrice: 5.50, sellingPrice: 12.99, stock: 40, image: "", createdAt: "2026-04-05T09:00:00Z", updatedAt: "2026-06-27T10:00:00Z" },
  { id: "p-047", name: "Jump Rope — Speed", sku: "SP-JRS-047", category: cat("Sports"), purchasePrice: 3.50, sellingPrice: 8.99, stock: 0, image: "", createdAt: "2026-04-10T10:00:00Z", updatedAt: "2026-07-02T08:00:00Z" },
  { id: "p-048", name: "Foam Roller 45cm", sku: "SP-FR4-048", category: cat("Sports"), purchasePrice: 7.00, sellingPrice: 15.99, stock: 2, image: "", createdAt: "2026-04-12T11:00:00Z", updatedAt: "2026-07-04T14:00:00Z" },
  { id: "p-049", name: "Sport Duffel Bag 40L", sku: "SP-SDB-049", category: cat("Sports"), purchasePrice: 15.00, sellingPrice: 32.99, stock: 10, image: "", createdAt: "2026-04-15T08:00:00Z", updatedAt: "2026-06-25T09:00:00Z" },
  { id: "p-050", name: "Grip Training Ball Set", sku: "SP-GTB-050", category: cat("Sports"), purchasePrice: 4.00, sellingPrice: 9.99, stock: 55, image: "", createdAt: "2026-04-18T09:30:00Z", updatedAt: "2026-06-23T11:00:00Z" },
];
