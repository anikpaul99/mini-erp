/* ============================================================
 * Mock Data — Customers (~15 customers)
 * ============================================================ */

import type { Customer } from "@/types/customer";

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust-01", name: "Sarah Mitchell", phone: "+1 (555) 234-5678", email: "sarah.mitchell@email.com", notes: "Prefers SMS receipts", totalPurchases: 8, createdAt: "2026-02-10T09:00:00Z" },
  { id: "cust-02", name: "James Rodriguez", phone: "+1 (555) 345-6789", email: "j.rodriguez@email.com", notes: "", totalPurchases: 12, createdAt: "2026-02-15T10:30:00Z" },
  { id: "cust-03", name: "Emily Chen", phone: "+1 (555) 456-7890", email: "emily.chen@work.com", notes: "Bulk buyer — corporate account", totalPurchases: 5, createdAt: "2026-02-20T08:00:00Z" },
  { id: "cust-04", name: "Michael Thompson", phone: "+1 (555) 567-8901", email: "", notes: "", totalPurchases: 3, createdAt: "2026-03-01T11:00:00Z" },
  { id: "cust-05", name: "Aisha Patel", phone: "+1 (555) 678-9012", email: "aisha.p@email.com", notes: "Loyal customer since day one", totalPurchases: 15, createdAt: "2026-03-05T09:30:00Z" },
  { id: "cust-06", name: "David Kim", phone: "+1 (555) 789-0123", email: "david.kim@company.io", notes: "", totalPurchases: 7, createdAt: "2026-03-10T14:00:00Z" },
  { id: "cust-07", name: "Lisa Johansson", phone: "+1 (555) 890-1234", email: "", notes: "Requests gift wrapping", totalPurchases: 2, createdAt: "2026-03-18T10:00:00Z" },
  { id: "cust-08", name: "Robert Okafor", phone: "+1 (555) 901-2345", email: "r.okafor@email.com", notes: "", totalPurchases: 9, createdAt: "2026-03-22T08:30:00Z" },
  { id: "cust-09", name: "Maria Garcia", phone: "+1 (555) 012-3456", email: "maria.g@email.com", notes: "", totalPurchases: 4, createdAt: "2026-04-01T11:30:00Z" },
  { id: "cust-10", name: "Alexander Volkov", phone: "+1 (555) 123-4567", email: "a.volkov@corp.com", notes: "Net-30 payment terms", totalPurchases: 6, createdAt: "2026-04-08T09:00:00Z" },
  { id: "cust-11", name: "Priya Sharma", phone: "+1 (555) 234-5670", email: "priya.s@email.com", notes: "", totalPurchases: 1, createdAt: "2026-04-15T10:00:00Z" },
  { id: "cust-12", name: "Thomas Wright", phone: "+1 (555) 345-6780", email: "", notes: "", totalPurchases: 11, createdAt: "2026-04-20T14:30:00Z" },
  { id: "cust-13", name: "Hannah Müller", phone: "+1 (555) 456-7891", email: "h.muller@email.com", notes: "Prefers email invoices", totalPurchases: 3, createdAt: "2026-05-01T08:00:00Z" },
  { id: "cust-14", name: "Carlos Mendez", phone: "+1 (555) 567-8902", email: "carlos.m@shop.com", notes: "", totalPurchases: 5, createdAt: "2026-05-10T11:00:00Z" },
  { id: "cust-15", name: "Fatima Al-Rashid", phone: "+1 (555) 678-9013", email: "fatima.r@email.com", notes: "VIP customer", totalPurchases: 20, createdAt: "2026-05-18T09:30:00Z" },
];
