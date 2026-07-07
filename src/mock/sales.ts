/* ============================================================
 * Mock Data — Sales (~30 sales)
 * ============================================================
 * Realistic sale history with varied line-item counts,
 * totals, and dates. Some linked to customers, some walk-ins.
 * ============================================================ */

import type { Sale } from "@/types/sale";

export const MOCK_SALES: Sale[] = [
  { id: "s-001", displayId: "#S-00001", customerId: "cust-01", customerName: "Sarah Mitchell", lineItems: [
    { productId: "p-001", productName: "Wireless Bluetooth Headphones", sku: "EL-WBH-001", unitPrice: 49.99, quantity: 1, subtotal: 49.99 },
    { productId: "p-002", productName: "USB-C Charging Cable (2m)", sku: "EL-UCC-002", unitPrice: 8.99, quantity: 2, subtotal: 17.98 },
  ], grandTotal: 67.97, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-01T09:15:00Z" },

  { id: "s-002", displayId: "#S-00002", customerName: undefined, lineItems: [
    { productId: "p-011", productName: "Organic Green Tea (100 bags)", sku: "GR-OGT-011", unitPrice: 9.99, quantity: 3, subtotal: 29.97 },
  ], grandTotal: 29.97, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-02T10:30:00Z" },

  { id: "s-003", displayId: "#S-00003", customerId: "cust-05", customerName: "Aisha Patel", lineItems: [
    { productId: "p-021", productName: "Classic Crew Neck T-Shirt", sku: "AP-CNT-021", unitPrice: 14.99, quantity: 4, subtotal: 59.96 },
    { productId: "p-026", productName: "Performance Running Shorts", sku: "AP-PRS-026", unitPrice: 19.99, quantity: 2, subtotal: 39.98 },
    { productId: "p-045", productName: "Yoga Mat 6mm — Purple", sku: "SP-YM6-045", unitPrice: 24.99, quantity: 1, subtotal: 24.99 },
  ], grandTotal: 124.93, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-03T14:45:00Z" },

  { id: "s-004", displayId: "#S-00004", customerId: "cust-02", customerName: "James Rodriguez", lineItems: [
    { productId: "p-006", productName: "Mechanical Keyboard TKL", sku: "EL-MKT-006", unitPrice: 64.99, quantity: 1, subtotal: 64.99 },
    { productId: "p-008", productName: "USB Hub 7-Port", sku: "EL-UH7-008", unitPrice: 19.99, quantity: 1, subtotal: 19.99 },
  ], grandTotal: 84.98, createdBy: "usr-01", createdByName: "Alex Morgan", createdAt: "2026-06-04T11:20:00Z" },

  { id: "s-005", displayId: "#S-00005", customerName: undefined, lineItems: [
    { productId: "p-029", productName: "A5 Hardcover Notebook", sku: "ST-A5H-029", unitPrice: 6.99, quantity: 5, subtotal: 34.95 },
    { productId: "p-030", productName: "Gel Pen Set (12 Colors)", sku: "ST-GP1-030", unitPrice: 7.49, quantity: 3, subtotal: 22.47 },
    { productId: "p-032", productName: "Sticky Notes Neon Pack", sku: "ST-SNN-032", unitPrice: 3.49, quantity: 10, subtotal: 34.90 },
  ], grandTotal: 92.32, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-05T08:50:00Z" },

  { id: "s-006", displayId: "#S-00006", customerId: "cust-03", customerName: "Emily Chen", lineItems: [
    { productId: "p-009", productName: "Noise Cancelling Earbuds", sku: "EL-NCE-009", unitPrice: 79.99, quantity: 5, subtotal: 399.95 },
    { productId: "p-005", productName: "LED Desk Lamp with Dimmer", sku: "EL-LDL-005", unitPrice: 34.99, quantity: 5, subtotal: 174.95 },
  ], grandTotal: 574.90, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-06T13:10:00Z" },

  { id: "s-007", displayId: "#S-00007", customerId: "cust-15", customerName: "Fatima Al-Rashid", lineItems: [
    { productId: "p-037", productName: "Scented Soy Candle — Vanilla", sku: "HL-SSC-037", unitPrice: 12.99, quantity: 3, subtotal: 38.97 },
    { productId: "p-043", productName: "Linen Cushion Cover 45cm", sku: "HL-LCC-043", unitPrice: 9.99, quantity: 4, subtotal: 39.96 },
    { productId: "p-041", productName: "Cotton Throw Blanket", sku: "HL-CTB-041", unitPrice: 27.99, quantity: 1, subtotal: 27.99 },
  ], grandTotal: 106.92, createdBy: "usr-04", createdByName: "Riley Brooks", createdAt: "2026-06-07T15:30:00Z" },

  { id: "s-008", displayId: "#S-00008", customerName: undefined, lineItems: [
    { productId: "p-012", productName: "Extra Virgin Olive Oil 500ml", sku: "GR-EVO-012", unitPrice: 12.49, quantity: 2, subtotal: 24.98 },
    { productId: "p-014", productName: "Quinoa Grain 1kg", sku: "GR-QG1-014", unitPrice: 7.99, quantity: 3, subtotal: 23.97 },
    { productId: "p-019", productName: "Organic Pasta 500g", sku: "GR-OP5-019", unitPrice: 3.99, quantity: 4, subtotal: 15.96 },
    { productId: "p-020", productName: "Mixed Nuts Trail Pack", sku: "GR-MNT-020", unitPrice: 6.99, quantity: 2, subtotal: 13.98 },
  ], grandTotal: 78.89, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-08T09:45:00Z" },

  { id: "s-009", displayId: "#S-00009", customerId: "cust-06", customerName: "David Kim", lineItems: [
    { productId: "p-046", productName: "Resistance Bands Set", sku: "SP-RBS-046", unitPrice: 12.99, quantity: 2, subtotal: 25.98 },
    { productId: "p-049", productName: "Sport Duffel Bag 40L", sku: "SP-SDB-049", unitPrice: 32.99, quantity: 1, subtotal: 32.99 },
  ], grandTotal: 58.97, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-09T16:20:00Z" },

  { id: "s-010", displayId: "#S-00010", customerId: "cust-08", customerName: "Robert Okafor", lineItems: [
    { productId: "p-023", productName: "Lightweight Rain Jacket", sku: "AP-LRJ-023", unitPrice: 39.99, quantity: 1, subtotal: 39.99 },
    { productId: "p-025", productName: "Denim Jacket — Washed Blue", sku: "AP-DJW-025", unitPrice: 49.99, quantity: 1, subtotal: 49.99 },
  ], grandTotal: 89.98, createdBy: "usr-01", createdByName: "Alex Morgan", createdAt: "2026-06-10T10:00:00Z" },

  { id: "s-011", displayId: "#S-00011", customerName: undefined, lineItems: [
    { productId: "p-042", productName: "Stainless Steel Water Bottle", sku: "HL-SSW-042", unitPrice: 16.99, quantity: 1, subtotal: 16.99 },
  ], grandTotal: 16.99, createdBy: "usr-04", createdByName: "Riley Brooks", createdAt: "2026-06-11T14:10:00Z" },

  { id: "s-012", displayId: "#S-00012", customerId: "cust-10", customerName: "Alexander Volkov", lineItems: [
    { productId: "p-001", productName: "Wireless Bluetooth Headphones", sku: "EL-WBH-001", unitPrice: 49.99, quantity: 3, subtotal: 149.97 },
    { productId: "p-010", productName: "Smart Plug Wi-Fi", sku: "EL-SPW-010", unitPrice: 14.99, quantity: 10, subtotal: 149.90 },
    { productId: "p-002", productName: "USB-C Charging Cable (2m)", sku: "EL-UCC-002", unitPrice: 8.99, quantity: 10, subtotal: 89.90 },
  ], grandTotal: 389.77, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-12T11:30:00Z" },

  { id: "s-013", displayId: "#S-00013", customerId: "cust-04", customerName: "Michael Thompson", lineItems: [
    { productId: "p-016", productName: "Almond Butter 250g", sku: "GR-AB2-016", unitPrice: 8.49, quantity: 2, subtotal: 16.98 },
    { productId: "p-017", productName: "Coconut Milk Can 400ml", sku: "GR-CMC-017", unitPrice: 3.49, quantity: 6, subtotal: 20.94 },
  ], grandTotal: 37.92, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-13T09:15:00Z" },

  { id: "s-014", displayId: "#S-00014", customerName: undefined, lineItems: [
    { productId: "p-034", productName: "Document Folder A4 (5-pack)", sku: "ST-DFA-034", unitPrice: 5.49, quantity: 4, subtotal: 21.96 },
    { productId: "p-035", productName: "Whiteboard Markers (4-pack)", sku: "ST-WBM-035", unitPrice: 6.99, quantity: 6, subtotal: 41.94 },
    { productId: "p-036", productName: "Paper Clips Box (100pc)", sku: "ST-PCB-036", unitPrice: 2.49, quantity: 5, subtotal: 12.45 },
  ], grandTotal: 76.35, createdBy: "usr-01", createdByName: "Alex Morgan", createdAt: "2026-06-14T08:40:00Z" },

  { id: "s-015", displayId: "#S-00015", customerId: "cust-09", customerName: "Maria Garcia", lineItems: [
    { productId: "p-039", productName: "Ceramic Plant Pot — Medium", sku: "HL-CPP-039", unitPrice: 11.99, quantity: 3, subtotal: 35.97 },
    { productId: "p-037", productName: "Scented Soy Candle — Vanilla", sku: "HL-SSC-037", unitPrice: 12.99, quantity: 2, subtotal: 25.98 },
  ], grandTotal: 61.95, createdBy: "usr-04", createdByName: "Riley Brooks", createdAt: "2026-06-15T12:00:00Z" },

  { id: "s-016", displayId: "#S-00016", customerId: "cust-12", customerName: "Thomas Wright", lineItems: [
    { productId: "p-021", productName: "Classic Crew Neck T-Shirt", sku: "AP-CNT-021", unitPrice: 14.99, quantity: 6, subtotal: 89.94 },
    { productId: "p-027", productName: "Wool Blend Beanie", sku: "AP-WBB-027", unitPrice: 12.99, quantity: 3, subtotal: 38.97 },
  ], grandTotal: 128.91, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-16T15:45:00Z" },

  { id: "s-017", displayId: "#S-00017", customerName: undefined, lineItems: [
    { productId: "p-050", productName: "Grip Training Ball Set", sku: "SP-GTB-050", unitPrice: 9.99, quantity: 2, subtotal: 19.98 },
    { productId: "p-046", productName: "Resistance Bands Set", sku: "SP-RBS-046", unitPrice: 12.99, quantity: 1, subtotal: 12.99 },
  ], grandTotal: 32.97, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-17T10:30:00Z" },

  { id: "s-018", displayId: "#S-00018", customerId: "cust-07", customerName: "Lisa Johansson", lineItems: [
    { productId: "p-029", productName: "A5 Hardcover Notebook", sku: "ST-A5H-029", unitPrice: 6.99, quantity: 2, subtotal: 13.98 },
    { productId: "p-030", productName: "Gel Pen Set (12 Colors)", sku: "ST-GP1-030", unitPrice: 7.49, quantity: 1, subtotal: 7.49 },
  ], grandTotal: 21.47, createdBy: "usr-04", createdByName: "Riley Brooks", createdAt: "2026-06-18T09:00:00Z" },

  { id: "s-019", displayId: "#S-00019", customerId: "cust-14", customerName: "Carlos Mendez", lineItems: [
    { productId: "p-011", productName: "Organic Green Tea (100 bags)", sku: "GR-OGT-011", unitPrice: 9.99, quantity: 5, subtotal: 49.95 },
    { productId: "p-012", productName: "Extra Virgin Olive Oil 500ml", sku: "GR-EVO-012", unitPrice: 12.49, quantity: 3, subtotal: 37.47 },
    { productId: "p-013", productName: "Raw Honey Jar 350g", sku: "GR-RHJ-013", unitPrice: 11.99, quantity: 2, subtotal: 23.98 },
  ], grandTotal: 111.40, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-19T13:20:00Z" },

  { id: "s-020", displayId: "#S-00020", customerName: undefined, lineItems: [
    { productId: "p-005", productName: "LED Desk Lamp with Dimmer", sku: "EL-LDL-005", unitPrice: 34.99, quantity: 1, subtotal: 34.99 },
  ], grandTotal: 34.99, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-20T08:15:00Z" },

  { id: "s-021", displayId: "#S-00021", customerId: "cust-11", customerName: "Priya Sharma", lineItems: [
    { productId: "p-043", productName: "Linen Cushion Cover 45cm", sku: "HL-LCC-043", unitPrice: 9.99, quantity: 6, subtotal: 59.94 },
    { productId: "p-042", productName: "Stainless Steel Water Bottle", sku: "HL-SSW-042", unitPrice: 16.99, quantity: 2, subtotal: 33.98 },
  ], grandTotal: 93.92, createdBy: "usr-01", createdByName: "Alex Morgan", createdAt: "2026-06-21T11:45:00Z" },

  { id: "s-022", displayId: "#S-00022", customerId: "cust-02", customerName: "James Rodriguez", lineItems: [
    { productId: "p-006", productName: "Mechanical Keyboard TKL", sku: "EL-MKT-006", unitPrice: 64.99, quantity: 2, subtotal: 129.98 },
    { productId: "p-009", productName: "Noise Cancelling Earbuds", sku: "EL-NCE-009", unitPrice: 79.99, quantity: 1, subtotal: 79.99 },
    { productId: "p-001", productName: "Wireless Bluetooth Headphones", sku: "EL-WBH-001", unitPrice: 49.99, quantity: 1, subtotal: 49.99 },
  ], grandTotal: 259.96, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-22T14:00:00Z" },

  { id: "s-023", displayId: "#S-00023", customerName: undefined, lineItems: [
    { productId: "p-045", productName: "Yoga Mat 6mm — Purple", sku: "SP-YM6-045", unitPrice: 24.99, quantity: 1, subtotal: 24.99 },
    { productId: "p-050", productName: "Grip Training Ball Set", sku: "SP-GTB-050", unitPrice: 9.99, quantity: 1, subtotal: 9.99 },
  ], grandTotal: 34.98, createdBy: "usr-04", createdByName: "Riley Brooks", createdAt: "2026-06-23T10:30:00Z" },

  { id: "s-024", displayId: "#S-00024", customerId: "cust-13", customerName: "Hannah Müller", lineItems: [
    { productId: "p-026", productName: "Performance Running Shorts", sku: "AP-PRS-026", unitPrice: 19.99, quantity: 3, subtotal: 59.97 },
    { productId: "p-023", productName: "Lightweight Rain Jacket", sku: "AP-LRJ-023", unitPrice: 39.99, quantity: 1, subtotal: 39.99 },
  ], grandTotal: 99.96, createdBy: "usr-03", createdByName: "Casey Taylor", createdAt: "2026-06-24T16:15:00Z" },

  { id: "s-025", displayId: "#S-00025", customerId: "cust-01", customerName: "Sarah Mitchell", lineItems: [
    { productId: "p-010", productName: "Smart Plug Wi-Fi", sku: "EL-SPW-010", unitPrice: 14.99, quantity: 4, subtotal: 59.96 },
  ], grandTotal: 59.96, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-25T09:30:00Z" },

  { id: "s-026", displayId: "#S-00026", customerName: undefined, lineItems: [
    { productId: "p-032", productName: "Sticky Notes Neon Pack", sku: "ST-SNN-032", unitPrice: 3.49, quantity: 20, subtotal: 69.80 },
    { productId: "p-036", productName: "Paper Clips Box (100pc)", sku: "ST-PCB-036", unitPrice: 2.49, quantity: 10, subtotal: 24.90 },
  ], grandTotal: 94.70, createdBy: "usr-01", createdByName: "Alex Morgan", createdAt: "2026-06-26T08:00:00Z" },

  { id: "s-027", displayId: "#S-00027", customerId: "cust-05", customerName: "Aisha Patel", lineItems: [
    { productId: "p-037", productName: "Scented Soy Candle — Vanilla", sku: "HL-SSC-037", unitPrice: 12.99, quantity: 5, subtotal: 64.95 },
    { productId: "p-041", productName: "Cotton Throw Blanket", sku: "HL-CTB-041", unitPrice: 27.99, quantity: 2, subtotal: 55.98 },
    { productId: "p-039", productName: "Ceramic Plant Pot — Medium", sku: "HL-CPP-039", unitPrice: 11.99, quantity: 2, subtotal: 23.98 },
  ], grandTotal: 144.91, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-27T13:00:00Z" },

  { id: "s-028", displayId: "#S-00028", customerId: "cust-15", customerName: "Fatima Al-Rashid", lineItems: [
    { productId: "p-021", productName: "Classic Crew Neck T-Shirt", sku: "AP-CNT-021", unitPrice: 14.99, quantity: 10, subtotal: 149.90 },
    { productId: "p-025", productName: "Denim Jacket — Washed Blue", sku: "AP-DJW-025", unitPrice: 49.99, quantity: 2, subtotal: 99.98 },
    { productId: "p-026", productName: "Performance Running Shorts", sku: "AP-PRS-026", unitPrice: 19.99, quantity: 5, subtotal: 99.95 },
    { productId: "p-027", productName: "Wool Blend Beanie", sku: "AP-WBB-027", unitPrice: 12.99, quantity: 5, subtotal: 64.95 },
  ], grandTotal: 414.78, createdBy: "usr-01", createdByName: "Alex Morgan", createdAt: "2026-06-28T11:00:00Z" },

  { id: "s-029", displayId: "#S-00029", customerName: undefined, lineItems: [
    { productId: "p-014", productName: "Quinoa Grain 1kg", sku: "GR-QG1-014", unitPrice: 7.99, quantity: 2, subtotal: 15.98 },
    { productId: "p-017", productName: "Coconut Milk Can 400ml", sku: "GR-CMC-017", unitPrice: 3.49, quantity: 4, subtotal: 13.96 },
  ], grandTotal: 29.94, createdBy: "usr-04", createdByName: "Riley Brooks", createdAt: "2026-06-29T10:00:00Z" },

  { id: "s-030", displayId: "#S-00030", customerId: "cust-06", customerName: "David Kim", lineItems: [
    { productId: "p-049", productName: "Sport Duffel Bag 40L", sku: "SP-SDB-049", unitPrice: 32.99, quantity: 2, subtotal: 65.98 },
    { productId: "p-045", productName: "Yoga Mat 6mm — Purple", sku: "SP-YM6-045", unitPrice: 24.99, quantity: 2, subtotal: 49.98 },
    { productId: "p-046", productName: "Resistance Bands Set", sku: "SP-RBS-046", unitPrice: 12.99, quantity: 3, subtotal: 38.97 },
  ], grandTotal: 154.93, createdBy: "usr-02", createdByName: "Jordan Lee", createdAt: "2026-06-30T15:30:00Z" },
];
