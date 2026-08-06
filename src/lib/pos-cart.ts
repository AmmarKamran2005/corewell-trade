/**
 * Till arithmetic, kept as pure functions.
 *
 * Money at a counter is checked by hand against a drawer, so every figure the
 * screen shows has to be reproducible: no floating rounding surprises, no
 * totals computed twice in two places. Components render these results, they
 * never do the maths themselves.
 */

import type { Product } from "@/data/products";
import type { TenderType } from "@/data/pos";

export type CartLine = {
  /** Stable key — one line per product; scanning the same item bumps qty. */
  productId: number;
  sku: string;
  name: string;
  unitPrice: number;
  qty: number;
  /** Per-line discount, 0–100. */
  discountPercent: number;
  taxRatePercent: number;
};

export type Tender = {
  id: string;
  type: TenderType;
  amount: number;
  reference?: string;
};

export type CartTotals = {
  grossSubtotal: number;
  lineDiscount: number;
  orderDiscount: number;
  netSubtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  lineCount: number;
};

export function lineGross(l: CartLine) {
  return l.unitPrice * l.qty;
}

export function lineDiscountAmount(l: CartLine) {
  return (lineGross(l) * l.discountPercent) / 100;
}

export function lineNet(l: CartLine) {
  return lineGross(l) - lineDiscountAmount(l);
}

/**
 * Order-level discount is spread across lines before tax, so the tax charged
 * matches what a customer actually paid — applying it after tax would overstate
 * the sales-tax liability.
 */
export function computeTotals(lines: CartLine[], orderDiscountPercent: number): CartTotals {
  const grossSubtotal = lines.reduce((s, l) => s + lineGross(l), 0);
  const lineDiscount = lines.reduce((s, l) => s + lineDiscountAmount(l), 0);
  const afterLineDiscount = grossSubtotal - lineDiscount;
  const orderDiscount = (afterLineDiscount * orderDiscountPercent) / 100;
  const netSubtotal = afterLineDiscount - orderDiscount;

  const spreadFactor = afterLineDiscount > 0 ? netSubtotal / afterLineDiscount : 0;
  const tax = lines.reduce(
    (s, l) => s + (lineNet(l) * spreadFactor * l.taxRatePercent) / 100,
    0
  );

  return {
    grossSubtotal: roundMinor(grossSubtotal),
    lineDiscount: roundMinor(lineDiscount),
    orderDiscount: roundMinor(orderDiscount),
    netSubtotal: roundMinor(netSubtotal),
    tax: roundMinor(tax),
    total: roundMinor(netSubtotal + tax),
    itemCount: lines.reduce((s, l) => s + l.qty, 0),
    lineCount: lines.length,
  };
}

export function tenderedTotal(tenders: Tender[]) {
  return roundMinor(tenders.reduce((s, t) => s + t.amount, 0));
}

/** Positive = still to collect. Negative = change owed to the customer. */
export function balanceDue(total: number, tenders: Tender[]) {
  return roundMinor(total - tenderedTotal(tenders));
}

export function changeDue(total: number, tenders: Tender[]) {
  return Math.max(0, roundMinor(tenderedTotal(tenders) - total));
}

export function addProduct(lines: CartLine[], product: Product, qty = 1): CartLine[] {
  const existing = lines.find((l) => l.productId === product.id);
  if (existing) {
    return lines.map((l) =>
      l.productId === product.id ? { ...l, qty: l.qty + qty } : l
    );
  }
  return [
    ...lines,
    {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unitPrice: product.salePrice,
      qty,
      discountPercent: 0,
      taxRatePercent: product.taxRatePercent,
    },
  ];
}

export function setQty(lines: CartLine[], productId: number, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.productId !== productId);
  return lines.map((l) => (l.productId === productId ? { ...l, qty } : l));
}

export function setLineDiscount(lines: CartLine[], productId: number, percent: number): CartLine[] {
  const clamped = Math.min(100, Math.max(0, percent));
  return lines.map((l) => (l.productId === productId ? { ...l, discountPercent: clamped } : l));
}

/**
 * Matches an exact barcode or SKU first — a scanner should never present a
 * chooser — then falls back to a fuzzy name search for typed queries.
 */
export function findByScan(catalogue: Product[], query: string): Product | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    catalogue.find((p) => p.barcodes.some((b) => b.toLowerCase() === q)) ??
    catalogue.find((p) => p.sku.toLowerCase() === q) ??
    null
  );
}

export function searchCatalogue(catalogue: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalogue;
  return catalogue.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcodes.some((b) => b.includes(q))
  );
}

/**
 * Money is held in whole minor units, so every figure the till derives has to
 * land on one. Rounding to two decimals instead leaves fractions of a cent
 * alive: a total of 5239.4 renders as $52.39, the exact-tender button offers
 * 52.39, and the sale is then left 0.4 of a cent short — displayed as $0.00,
 * with Complete sale disabled and nothing on screen explaining why.
 */
function roundMinor(n: number) {
  return Math.round(n + Number.EPSILON);
}
