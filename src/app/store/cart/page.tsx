"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Clock, AlertTriangle } from "lucide-react";
import { products } from "@/data/products";
import { stockPromise } from "@/data/store";
import { useBasket } from "@/components/store/basket-provider";
import { ProductThumb } from "@/components/store/product-card";
import { computeBasket, promoIsValid } from "@/lib/store-cart";
import { formatMoney } from "@/lib/format";
import { toast } from "@/components/ui/toaster";

export default function BasketPage() {
  const { lines, setQty, remove, ready } = useBasket();
  const [promoInput, setPromoInput] = React.useState("");
  const [promo, setPromo] = React.useState("");
  const [promoError, setPromoError] = React.useState("");

  const totals = computeBasket(lines, { deliveryCode: "STANDARD", promo });

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const check = promoIsValid(promoInput, totals.subtotal);
    if (!check.ok) {
      setPromoError(check.reason);
      setPromo("");
      return;
    }
    setPromoError("");
    setPromo(promoInput.trim().toUpperCase());
    toast.success("Code applied", { description: check.promo.label });
  }

  /* Stock moves between adding to the basket and checking out — the trade desk
     and the till sell from the same pool. Say so before the shopper pays. */
  const stockWarnings = lines
    .map((l) => {
      const p = products.find((x) => x.id === l.productId);
      if (!p) return null;
      const promise = stockPromise(p);
      if (promise.state === "BACKORDER") return { line: l, kind: "backorder" as const, available: 0 };
      if (l.qty > promise.available) return { line: l, kind: "short" as const, available: promise.available };
      return null;
    })
    .filter(Boolean) as { line: (typeof lines)[number]; kind: "backorder" | "short"; available: number }[];

  if (!ready) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-500">Loading your basket…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="size-14 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="size-6 text-slate-400" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-navy-900 dark:text-white">Your basket is empty</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Browse the catalogue and add something to get started.
        </p>
        <Link
          href="/store/products"
          className="mt-6 inline-flex h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold items-center gap-2 hover:bg-brand-700"
        >
          Shop all products
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Your basket</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
      </p>

      {stockWarnings.length > 0 && (
        <div role="status" className="mt-5 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-warning flex-shrink-0 mt-0.5" aria-hidden />
          <div className="text-xs text-slate-700 dark:text-slate-200">
            <p className="font-semibold text-warning">Stock changed while you were shopping</p>
            <ul className="mt-1 space-y-0.5">
              {stockWarnings.map((w) => (
                <li key={w.line.productId}>
                  {w.kind === "backorder"
                    ? `${w.line.name} is now on backorder — it will ship separately in 7–10 days.`
                    : `Only ${w.available} of ${w.line.name} left; the remaining ${w.line.qty - w.available} will follow as a backorder.`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-6 items-start">
        {/* Lines */}
        <ul className="rounded-xl border border-slate-200 dark:border-navy-700 divide-y divide-slate-100 dark:divide-navy-800">
          {lines.map((l) => {
            const product = products.find((p) => p.id === l.productId);
            const promise = product ? stockPromise(product) : null;
            return (
              <li key={l.productId} className="p-4 flex gap-4">
                {product && (
                  <Link href={`/store/products/${product.sku}`} className="flex-shrink-0">
                    <ProductThumb product={product} className="size-20 rounded-lg" />
                  </Link>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-medium text-navy-900 dark:text-white leading-snug">
                    {product ? (
                      <Link href={`/store/products/${product.sku}`} className="hover:text-brand">{l.name}</Link>
                    ) : l.name}
                  </h2>
                  <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">{l.sku}</p>
                  {promise?.state === "BACKORDER" && (
                    <p className="inline-flex items-center gap-1 text-2xs text-info font-medium mt-1">
                      <Clock className="size-3" aria-hidden />
                      Ships in 7–10 days
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-navy-700 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty - 1)}
                        aria-label={`Decrease quantity of ${l.name}`}
                        className="size-10 inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm tabular font-semibold text-navy-900 dark:text-white">{l.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty + 1)}
                        aria-label={`Increase quantity of ${l.name}`}
                        className="size-10 inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(l.productId)}
                      className="h-10 px-2 inline-flex items-center gap-1.5 text-2xs font-medium text-slate-500 hover:text-danger"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm tabular font-bold text-navy-900 dark:text-white">
                    {formatMoney(l.unitPrice * l.qty)}
                  </p>
                  {l.qty > 1 && (
                    <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatMoney(l.unitPrice)} each
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside className="rounded-xl border border-slate-200 dark:border-navy-700 p-4 lg:sticky lg:top-32">
          <h2 className="text-sm font-bold text-navy-900 dark:text-white">Order summary</h2>

          <form onSubmit={applyPromo} className="mt-4">
            <label htmlFor="promo" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Promo code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
                <input
                  id="promo"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                  placeholder="WELCOME10"
                  aria-invalid={!!promoError}
                  aria-describedby={promoError ? "promo-error" : undefined}
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-sm text-navy-900 dark:text-white uppercase placeholder:normal-case focus:outline-none focus:border-brand"
                />
              </div>
              <button type="submit" className="h-11 px-4 rounded-lg border border-slate-200 dark:border-navy-700 text-sm font-semibold text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-800">
                Apply
              </button>
            </div>
            {promoError && (
              <p id="promo-error" role="alert" className="text-2xs text-danger mt-1.5">{promoError}</p>
            )}
          </form>

          <dl className="mt-5 space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatMoney(totals.subtotal)} />
            {totals.discount > 0 && (
              <SummaryRow label={`Discount (${promo})`} value={`− ${formatMoney(totals.discount)}`} tone="success" />
            )}
            <SummaryRow
              label="Standard delivery"
              value={totals.deliveryFee === 0 ? "Free" : formatMoney(totals.deliveryFee)}
              tone={totals.deliveryFee === 0 ? "success" : undefined}
            />
          </dl>

          {totals.freeDeliveryShortfall != null && (
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-2">
              Add {formatMoney(totals.freeDeliveryShortfall)} more for free standard delivery.
            </p>
          )}

          <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-slate-200 dark:border-navy-700">
            <span className="text-sm font-semibold text-navy-900 dark:text-white">Total</span>
            <span className="text-2xl tabular font-bold text-navy-900 dark:text-white">{formatMoney(totals.total)}</span>
          </div>
          <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
            Includes {formatMoney(totals.taxIncluded)} sales tax
          </p>

          <Link
            href={`/store/checkout${promo ? `?promo=${promo}` : ""}`}
            className="mt-4 w-full h-12 rounded-lg bg-brand text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
          >
            Checkout
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/store/products"
            className="mt-2 w-full h-11 rounded-lg border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white text-sm font-medium inline-flex items-center justify-center hover:bg-slate-50 dark:hover:bg-navy-800"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className={tone === "success" ? "tabular font-medium text-success" : "tabular font-medium text-navy-900 dark:text-white"}>
        {value}
      </dd>
    </div>
  );
}
