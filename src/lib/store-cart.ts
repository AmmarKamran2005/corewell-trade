/**
 * Storefront basket arithmetic.
 *
 * Retail is quoted tax-inclusive, so the tax line here is *extracted* from the
 * price rather than added to it. Getting that backwards is the single most
 * common consumer-pricing bug: the shopper sees one number on the tile and a
 * larger one at checkout, and abandons the basket.
 */

import type { Product } from "@/data/products";
import {
  deliveryMethods, paymentMethods, promoCodes, retailPrice, stockPromise,
} from "@/data/store";

export type BasketLine = {
  productId: number;
  sku: string;
  name: string;
  unitPrice: number;
  qty: number;
  /** Captured at add-to-basket time so the basket can warn if stock moved. */
  availableAtAdd: number;
  backorder: boolean;
};

export type BasketTotals = {
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  surcharge: number;
  taxIncluded: number;
  total: number;
  freeDeliveryShortfall: number | null;
};

const TAX_RATE = 18;

export function addToBasket(lines: BasketLine[], p: Product, qty = 1): BasketLine[] {
  const promise = stockPromise(p);
  const existing = lines.find((l) => l.productId === p.id);
  if (existing) {
    return lines.map((l) => (l.productId === p.id ? { ...l, qty: l.qty + qty } : l));
  }
  return [
    ...lines,
    {
      productId: p.id,
      sku: p.sku,
      name: p.name,
      unitPrice: retailPrice(p),
      qty,
      availableAtAdd: promise.available,
      backorder: promise.state === "BACKORDER",
    },
  ];
}

export function setBasketQty(lines: BasketLine[], productId: number, qty: number): BasketLine[] {
  if (qty <= 0) return lines.filter((l) => l.productId !== productId);
  return lines.map((l) => (l.productId === productId ? { ...l, qty } : l));
}

export function computeBasket(
  lines: BasketLine[],
  opts: { deliveryCode?: string; paymentCode?: string; promo?: string } = {}
): BasketTotals {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0));

  const promo = promoCodes.find(
    (p) => p.code === (opts.promo ?? "").trim().toUpperCase() && subtotal >= p.minSubtotal
  );
  const discount = promo ? round2((subtotal * promo.percentOff) / 100) : 0;
  const afterDiscount = subtotal - discount;

  const method = deliveryMethods.find((d) => d.code === opts.deliveryCode) ?? null;
  let deliveryFee = method ? method.fee : 0;
  let freeDeliveryShortfall: number | null = null;
  if (method?.freeOver != null) {
    if (afterDiscount >= method.freeOver) deliveryFee = 0;
    else freeDeliveryShortfall = round2(method.freeOver - afterDiscount);
  }

  const payment = paymentMethods.find((p) => p.code === opts.paymentCode) ?? null;
  const surcharge = payment ? payment.surcharge : 0;

  const total = round2(afterDiscount + deliveryFee + surcharge);
  /* Retail prices already contain the tax — show the shopper how much of what
     they are paying is tax, without changing what they pay. */
  const taxIncluded = round2(afterDiscount - afterDiscount / (1 + TAX_RATE / 100));

  return {
    itemCount: lines.reduce((s, l) => s + l.qty, 0),
    subtotal,
    discount,
    deliveryFee,
    surcharge,
    taxIncluded,
    total,
    freeDeliveryShortfall,
  };
}

export function promoIsValid(code: string, subtotal: number) {
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false as const, reason: "" };
  const promo = promoCodes.find((p) => p.code === c);
  if (!promo) return { ok: false as const, reason: "That code isn’t recognised." };
  if (subtotal < promo.minSubtotal)
    return { ok: false as const, reason: `Spend ${promo.minSubtotal.toLocaleString("en-PK")} to use this code.` };
  return { ok: true as const, promo };
}

/** Cash on delivery is capped — riders do not carry large change. */
export function paymentUnavailableReason(code: string, total: number): string | null {
  const p = paymentMethods.find((x) => x.code === code);
  if (!p) return null;
  if (p.maxOrderValue != null && total > p.maxOrderValue) {
    return `Not available above ${p.maxOrderValue.toLocaleString("en-PK")}. Please pay online.`;
  }
  return null;
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
