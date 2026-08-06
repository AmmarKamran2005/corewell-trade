/**
 * Mock parties data — Nortex mobile accessories distribution counterparties.
 * Real-world Local mobile shop names from Riverside Plaza, Market Row, etc.
 */

import { initials } from "@/lib/format";

export type PartyType = "CUSTOMER" | "SUPPLIER" | "BOTH";
export type PartyCategory = "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "MANUFACTURER" | "AGENT";

export type Party = {
  id: number;
  partyCode: string;
  type: PartyType;
  legalName: string;
  displayName: string;
  initials: string;
  phone: string;
  email: string | null;
  city: string;
  province: string;
  category: PartyCategory;
  taxId: string | null;
  creditLimit: number;
  creditDays: number;
  creditHoldPolicy: "NONE" | "WARN" | "BLOCK";
  currentBalance: number;
  payableBalance: number;
  lastPaymentAt: string | null;
  lastPurchaseAt: string | null;
  lastSupplyAt: string | null;
  salesPerson: string | null;
  isActive: boolean;
  createdAt: string;
  branchId: number;
  rating: "A" | "B" | "C" | "D";
};

const make = (
  id: number,
  partyCode: string,
  type: PartyType,
  legalName: string,
  city: string,
  category: PartyCategory,
  phone: string,
  opts: Partial<Party> = {}
): Party => ({
  id,
  partyCode,
  type,
  legalName,
  displayName: legalName,
  initials: initials(legalName),
  phone,
  email: opts.email ?? null,
  city,
  province: opts.province ?? cityToProvince(city),
  category,
  taxId: opts.taxId ?? null,
  creditLimit: opts.creditLimit ?? 0,
  creditDays: opts.creditDays ?? 0,
  creditHoldPolicy: opts.creditHoldPolicy ?? "WARN",
  currentBalance: opts.currentBalance ?? 0,
  payableBalance: opts.payableBalance ?? 0,
  lastPaymentAt: opts.lastPaymentAt ?? null,
  lastPurchaseAt: opts.lastPurchaseAt ?? null,
  lastSupplyAt: opts.lastSupplyAt ?? null,
  salesPerson: opts.salesPerson ?? null,
  isActive: opts.isActive ?? true,
  createdAt: opts.createdAt ?? "2025-08-01",
  branchId: opts.branchId ?? 1,
  rating: opts.rating ?? "B",
});

function cityToProvince(city: string): string {
  if (["Central", "Lakeside", "Fairview", "Brookside"].includes(city)) return city === "Brookside" ? "West Region" : "South Region";
  if (["Northgate", "Fairview", "Eastvale", "Stonebridge", "Westport", "Westport"].includes(city)) return "North Region";
  if (["Harbour"].includes(city)) return "Harbour District";
  if (["Oakfield", "Redhill", "Summit"].includes(city)) return "East Region";
  return "the region";
}

export const parties: Party[] = [
  /* CUSTOMERS */
  make(1,  "NX-C-0001", "CUSTOMER", "Riverside Plaza Shop #28",     "Northgate",     "WHOLESALER",  "555 07890",  { creditLimit: 500000, creditDays: 30, currentBalance: 245000, lastPaymentAt: "2026-04-25", salesPerson: "Sara Doyle",   taxId: "1234567-8", email: "info@riversideplaza.com", rating: "A", branchId: 2 }),
  make(2,  "NX-C-0002", "CUSTOMER", "Mobile Zone Northgate",         "Northgate",     "RETAILER",    "555 04567",  { creditLimit: 200000, creditDays: 15, currentBalance: 212400, lastPaymentAt: "2026-03-10", creditHoldPolicy: "BLOCK", salesPerson: "Sara Doyle", rating: "C", branchId: 2 }),
  make(3,  "NX-C-0003", "CUSTOMER", "Market Row Mobile Plaza",        "Central",    "RETAILER",    "555 06543",  { creditLimit: 150000, creditDays: 30, currentBalance: 32750,  lastPaymentAt: "2026-04-28", salesPerson: "Hugo Ramos", taxId: "9876543-2", email: "marketrowmobile@example.com", rating: "B" }),
  make(4,  "NX-C-0004", "CUSTOMER", "Harbour Distributors",     "Harbour",  "DISTRIBUTOR", "555 09012",  { creditLimit: 1500000, creditDays: 45, currentBalance: 884000, lastPaymentAt: "2026-04-20", salesPerson: "Ben Alder", taxId: "5678901-2", rating: "A", branchId: 3 }),
  make(5,  "NX-C-0005", "CUSTOMER", "Cellular World Central",         "Central",    "WHOLESALER",  "555 01234",  { creditLimit: 800000, creditDays: 30, currentBalance: 156200, lastPaymentAt: "2026-04-15", salesPerson: "Hugo Ramos", taxId: "3456789-0", rating: "B" }),
  make(6,  "NX-C-0006", "CUSTOMER", "Fairview Mobile Mart",         "Northgate",     "RETAILER",    "555 04556",  { creditLimit: 100000, creditDays: 15, currentBalance: 18400,  lastPaymentAt: "2026-04-29", salesPerson: "Sara Doyle", rating: "B", branchId: 2 }),
  make(7,  "NX-C-0007", "CUSTOMER", "Brookside Cellular",            "Brookside",     "RETAILER",    "555 06778",  { creditLimit: 50000, creditDays: 15, currentBalance: 0, lastPaymentAt: null, salesPerson: "Hugo Ramos", rating: "B" }),
  make(8,  "NX-C-0008", "CUSTOMER", "Linkline Connect Northgate",    "Northgate",     "WHOLESALER",  "555 03445",  { creditLimit: 600000, creditDays: 30, currentBalance: 425000, lastPaymentAt: "2026-04-18", salesPerson: "Sara Doyle", rating: "A", branchId: 2 }),
  make(9,  "NX-C-0009", "CUSTOMER", "Mobile Mart Eastvale",         "Eastvale",     "RETAILER",    "555 07889",  { creditLimit: 75000, creditDays: 15, currentBalance: 64500, lastPaymentAt: "2026-03-22", creditHoldPolicy: "WARN", salesPerson: "Ben Alder", rating: "C", branchId: 2 }),
  make(10, "NX-C-0010", "CUSTOMER", "Star Communications",        "Fairview", "DISTRIBUTOR", "555 08990",  { creditLimit: 1200000, creditDays: 45, currentBalance: 985000, lastPaymentAt: "2026-04-22", salesPerson: "Sara Doyle", taxId: "2233445-6", rating: "A", branchId: 2 }),
  make(11, "NX-C-0011", "CUSTOMER", "Pak Mobile Centre",          "Oakfield",   "RETAILER",    "555 09001",  { creditLimit: 100000, creditDays: 15, currentBalance: 28000, lastPaymentAt: "2026-04-17", salesPerson: "Ben Alder", rating: "B", branchId: 3 }),
  make(12, "NX-C-0012", "CUSTOMER", "Meridian Distributors",      "Harbour",  "DISTRIBUTOR", "555 02334",  { creditLimit: 1000000, creditDays: 45, currentBalance: 218000, lastPaymentAt: "2026-04-30", salesPerson: "Ben Alder", taxId: "7788990-1", rating: "A", branchId: 3 }),
  make(13, "NX-C-0013", "CUSTOMER", "Eden Mobile Lakeside",      "Lakeside",  "RETAILER",    "555 06778",  { creditLimit: 75000, creditDays: 15, currentBalance: 12000, lastPaymentAt: "2026-04-26", salesPerson: "Hugo Ramos", rating: "B" }),
  make(14, "NX-C-0014", "CUSTOMER", "Universal Mobile Westport",   "Westport",    "WHOLESALER",  "555 05667",  { creditLimit: 400000, creditDays: 30, currentBalance: 195000, lastPaymentAt: "2026-04-12", salesPerson: "Sara Doyle", rating: "B", branchId: 2 }),
  make(15, "NX-C-0015", "CUSTOMER", "Galaxy Phones & Accessories","Stonebridge", "RETAILER",    "555 08990",  { creditLimit: 150000, creditDays: 30, currentBalance: 88500, lastPaymentAt: "2026-04-19", salesPerson: "Ben Alder", rating: "B", branchId: 3 }),

  /* SUPPLIERS */
  make(20, "NX-S-0001", "SUPPLIER", "Grand Plaza Trading",   "Central", "MANUFACTURER", "+86 138 0012 3456", { payableBalance: 1850000, lastSupplyAt: "2026-04-25", taxId: "9999991-1", email: "sales@cmp-trading.cn", rating: "A" }),
  make(21, "NX-S-0002", "SUPPLIER", "Shenzhen Electronics Hub",      "Central", "MANUFACTURER", "+86 139 2233 4455", { payableBalance: 1240000, lastSupplyAt: "2026-04-20", taxId: "9999992-2", email: "info@sz-electronics.cn", rating: "A" }),
  make(22, "NX-S-0003", "SUPPLIER", "Central Wholesale Traders",       "Central", "WHOLESALER",   "555 05667",       { payableBalance: 480000, lastSupplyAt: "2026-04-18", taxId: "9999993-3", rating: "B" }),
  make(23, "NX-S-0004", "SUPPLIER", "Apex Accessories Imports",       "Central", "WHOLESALER",   "555 06778",       { payableBalance: 320000, lastSupplyAt: "2026-04-15", taxId: "9999994-4", rating: "B" }),
  make(24, "NX-S-0005", "SUPPLIER", "Audio Tech International",      "Northgate",  "MANUFACTURER", "+86 137 6677 8899",  { payableBalance: 950000, lastSupplyAt: "2026-04-10", taxId: "9999995-5", rating: "A", branchId: 2 }),

  /* BOTH (rare but exist — supplier who also buys returned/excess) */
  make(30, "NX-B-0001", "BOTH",     "Tech Bazaar Pvt Ltd",           "Northgate",  "WHOLESALER",   "555 08776",       { creditLimit: 300000, creditDays: 30, currentBalance: 95000, payableBalance: 240000, lastPaymentAt: "2026-04-21", lastSupplyAt: "2026-04-12", salesPerson: "Sara Doyle", taxId: "8888888-1", rating: "B", branchId: 2 }),
];

export function getParty(id: number) {
  return parties.find((p) => p.id === id);
}

export function getPartyByCode(code: string) {
  return parties.find((p) => p.partyCode === code);
}
