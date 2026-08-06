/**
 * Point-of-sale seed data.
 *
 * The till deliberately reads the SAME product catalogue as the ERP
 * (`@/data/products`) — a POS that keeps its own product list is two systems
 * pretending to be one. Only the concepts that genuinely belong to a counter
 * live here: terminals, register sessions, tenders, parked sales and receipts.
 */

import { products } from "./products";

/* ─────────────────────────── Terminals ─────────────────────────── */

export type Terminal = {
  id: number;
  code: string;
  name: string;
  branch: string;
  branchCode: string;
  isActive: boolean;
};

export const terminals: Terminal[] = [
  { id: 1, code: "CEN-T1", name: "Counter 1", branch: "Central",   branchCode: "CEN", isActive: true },
  { id: 2, code: "CEN-T2", name: "Counter 2", branch: "Central",   branchCode: "CEN", isActive: true },
  { id: 3, code: "NGT-T1", name: "Counter 1", branch: "Northgate",    branchCode: "NGT", isActive: true },
  { id: 4, code: "HBR-T1", name: "Counter 1", branch: "Harbour", branchCode: "HBR", isActive: false },
];

/* ─────────────────────────── Tenders ───────────────────────────── */

export type TenderType = "CASH" | "CARD" | "EASYPAISA" | "JAZZCASH";

export type TenderMeta = {
  type: TenderType;
  label: string;
  /** Only cash can over-tender and return change. */
  givesChange: boolean;
  /** Reference number required (last 4 digits, transaction id…). */
  needsReference: boolean;
  hint: string;
};

export const tenderTypes: TenderMeta[] = [
  { type: "CASH",      label: "Cash",      givesChange: true,  needsReference: false, hint: "Notes and coins in the drawer" },
  { type: "CARD",      label: "Card",      givesChange: false, needsReference: true,  hint: "Debit or credit, via the terminal" },
  { type: "EASYPAISA", label: "WalletPay", givesChange: false, needsReference: true,  hint: "Mobile wallet transfer" },
  { type: "JAZZCASH",  label: "PayLink",  givesChange: false, needsReference: true,  hint: "Mobile wallet transfer" },
];

/** Notes a Local drawer actually holds — used for the quick-cash buttons. */
export const cashDenominations = [100, 500, 1000, 2000, 5000, 10000];

/* ─────────────────────── Register session ──────────────────────── */

export type RegisterSession = {
  id: number;
  terminalCode: string;
  cashier: string;
  openedAt: string;
  openingFloat: number;
  status: "OPEN" | "CLOSED";
};

export const currentSession: RegisterSession = {
  id: 1,
  terminalCode: "CEN-T1",
  cashier: "Sara Doyle",
  openedAt: "2026-05-02T09:04:00",
  openingFloat: 10000,
  status: "OPEN",
};

/** Running totals for the open shift — what an X report prints. */
export const sessionTotals = {
  sales: 47,
  returns: 3,
  grossSales: 186_450,
  refunds: 8_240,
  discounts: 4_120,
  tax: 12_380,
  byTender: [
    { type: "CASH" as TenderType,      count: 28, amount: 82_300 },
    { type: "CARD" as TenderType,      count: 11, amount: 61_400 },
    { type: "EASYPAISA" as TenderType, count: 5,  amount: 24_150 },
    { type: "JAZZCASH" as TenderType,  count: 3,  amount: 10_360 },
  ],
  cashPaidOut: 2_500,
};

/* ───────────────────────── Parked sales ────────────────────────── */

export type ParkedSale = {
  id: number;
  reference: string;
  customerName: string;
  parkedAt: string;
  itemCount: number;
  total: number;
  note: string;
  lineProductIds: number[];
};

export const parkedSales: ParkedSale[] = [
  { id: 1, reference: "PARK-0031", customerName: "Walk-in",              parkedAt: "11:42", itemCount: 3, total: 4_260,  note: "Fetching cash from the car",     lineProductIds: [1, 7, 12] },
  { id: 2, reference: "PARK-0030", customerName: "Market Row Mobile Plaza",  parkedAt: "11:18", itemCount: 6, total: 18_940, note: "Waiting on owner's approval",    lineProductIds: [2, 3, 8, 9, 14, 15] },
  { id: 3, reference: "PARK-0029", customerName: "Walk-in",              parkedAt: "10:55", itemCount: 1, total: 1_280,  note: "Checking a different colour",    lineProductIds: [4] },
];

/* ─────────────────── Receipts (for counter returns) ─────────────── */

export type ReceiptLine = {
  productId: number;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  /** How many of this line have already been returned on an earlier visit. */
  alreadyReturned: number;
};

export type Receipt = {
  id: number;
  receiptNo: string;
  soldAt: string;
  cashier: string;
  terminalCode: string;
  customerName: string;
  tender: TenderType;
  total: number;
  lines: ReceiptLine[];
};

const line = (productId: number, qty: number, alreadyReturned = 0): ReceiptLine => {
  const p = products.find((x) => x.id === productId)!;
  return { productId, name: p.name, sku: p.sku, qty, unitPrice: p.salePrice, alreadyReturned };
};

export const receipts: Receipt[] = [
  {
    id: 1, receiptNo: "CEN-T1-26-004128", soldAt: "2026-05-02T10:12:00", cashier: "Sara Doyle",
    terminalCode: "CEN-T1", customerName: "Walk-in", tender: "CASH", total: 4_940,
    lines: [line(1, 2), line(11, 1), line(19, 3)],
  },
  {
    id: 2, receiptNo: "CEN-T1-26-004127", soldAt: "2026-05-02T09:58:00", cashier: "Sara Doyle",
    terminalCode: "CEN-T1", customerName: "Mobile Zone Northgate", tender: "CARD", total: 12_760,
    lines: [line(3, 2), line(8, 1, 1), line(15, 4)],
  },
  {
    id: 3, receiptNo: "CEN-T2-26-004119", soldAt: "2026-05-01T17:31:00", cashier: "Zara Malik",
    terminalCode: "CEN-T2", customerName: "Walk-in", tender: "EASYPAISA", total: 2_180,
    lines: [line(7, 1), line(22, 2)],
  },
];

/** Reason codes a counter return must carry — free text alone is unauditable. */
export const returnReasons = [
  "Faulty on arrival",
  "Wrong item picked",
  "Customer changed mind",
  "Damaged packaging",
  "Warranty replacement",
] as const;

export type ReturnReason = (typeof returnReasons)[number];

/** Condition decides whether stock goes back on the shelf or to the damaged warehouse. */
export const returnConditions = [
  { value: "RESALABLE", label: "Resalable", hint: "Back into sellable stock" },
  { value: "DAMAGED",   label: "Damaged",   hint: "Into the damaged-goods warehouse" },
] as const;

export type ReturnCondition = (typeof returnConditions)[number]["value"];
