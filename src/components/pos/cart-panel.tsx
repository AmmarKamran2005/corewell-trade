"use client";

import * as React from "react";
import { Minus, Plus, Trash2, ShoppingCart, Percent, PauseCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import {
  type CartLine,
  type CartTotals,
  lineNet,
  lineGross,
} from "@/lib/pos-cart";
import { cn } from "@/lib/utils";

export function CartPanel({
  lines,
  totals,
  customerName,
  orderDiscountPercent,
  onQtyChange,
  onRemove,
  onLineDiscount,
  onOrderDiscount,
  onPark,
  onClear,
  onPay,
}: {
  lines: CartLine[];
  totals: CartTotals;
  customerName: string;
  orderDiscountPercent: number;
  onQtyChange: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
  onLineDiscount: (productId: number, percent: number) => void;
  onOrderDiscount: (percent: number) => void;
  onPark: () => void;
  onClear: () => void;
  onPay: () => void;
}) {
  const empty = lines.length === 0;

  return (
    <aside
      aria-label="Current sale"
      className="w-full h-full flex flex-col bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700"
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-navy-700 flex items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-navy-900 dark:text-white">Current sale</h2>
          <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">{customerName}</p>
        </div>
        <Badge variant={empty ? "muted" : "accent"} className="ml-auto tabular">
          {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
        </Badge>
      </div>

      {/* Lines */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="size-12 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mb-3">
              <ShoppingCart className="size-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-navy-900 dark:text-white">No items yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scan a barcode or tap a product to start.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-navy-800">
            {lines.map((l) => (
              <li key={l.productId} className="p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-navy-900 dark:text-white leading-snug line-clamp-2">
                      {l.name}
                    </p>
                    <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">
                      {l.sku} · {formatMoney(l.unitPrice)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(l.productId)}
                    aria-label={`Remove ${l.name} from the sale`}
                    className="size-8 -mt-1 -mr-1 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-danger/10 hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {/* Stepper — 44px targets so it works with a fingertip */}
                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-navy-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onQtyChange(l.productId, l.qty - 1)}
                      aria-label={`Reduce quantity of ${l.name}`}
                      className="size-11 sm:size-9 inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700 hover:text-navy-900 dark:hover:text-white transition-colors"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={l.qty}
                      onChange={(e) => onQtyChange(l.productId, Number(e.target.value))}
                      aria-label={`Quantity of ${l.name}`}
                      className="w-11 h-11 sm:h-9 text-center text-sm tabular font-semibold bg-transparent text-navy-900 dark:text-white border-x border-slate-200 dark:border-navy-700 focus:outline-none focus:bg-brand-50 dark:focus:bg-navy-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => onQtyChange(l.productId, l.qty + 1)}
                      aria-label={`Increase quantity of ${l.name}`}
                      className="size-11 sm:size-9 inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700 hover:text-navy-900 dark:hover:text-white transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Line discount */}
                  <label className="relative flex-shrink-0" title={`Discount on ${l.name}`}>
                    <span className="sr-only">Discount percent for {l.name}</span>
                    <Percent className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      value={l.discountPercent || ""}
                      placeholder="0"
                      onChange={(e) => onLineDiscount(l.productId, Number(e.target.value))}
                      className="w-16 h-11 sm:h-9 pl-6 pr-2 text-sm tabular rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-navy-900 dark:text-white focus:outline-none focus:border-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </label>

                  <div className="ml-auto text-right">
                    {l.discountPercent > 0 && (
                      <span className="block text-2xs tabular text-slate-400 line-through">
                        {formatMoney(lineGross(l))}
                      </span>
                    )}
                    <span className="block text-sm tabular font-bold text-navy-900 dark:text-white">
                      {formatMoney(lineNet(l))}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-navy-700 p-4 space-y-3">
        <dl className="space-y-1.5 text-xs">
          <Row label="Subtotal" value={formatMoney(totals.grossSubtotal)} />
          {totals.lineDiscount > 0 && (
            <Row label="Line discounts" value={`− ${formatMoney(totals.lineDiscount)}`} tone="success" />
          )}
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="order-discount" className="text-slate-500 dark:text-slate-400">
              Order discount
            </label>
            <div className="flex items-center gap-2">
              {totals.orderDiscount > 0 && (
                <span className="tabular text-success font-medium">− {formatMoney(totals.orderDiscount)}</span>
              )}
              <div className="relative">
                <input
                  id="order-discount"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  value={orderDiscountPercent || ""}
                  placeholder="0"
                  onChange={(e) => onOrderDiscount(Number(e.target.value))}
                  className="w-16 h-8 pl-2 pr-5 text-xs tabular text-right rounded-md border border-slate-200 dark:border-navy-700 bg-transparent text-navy-900 dark:text-white focus:outline-none focus:border-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-slate-400 pointer-events-none">%</span>
              </div>
            </div>
          </div>
          <Row label="Sales tax" value={formatMoney(totals.tax)} />
        </dl>

        <div className="flex items-baseline justify-between pt-3 border-t border-slate-200 dark:border-navy-700">
          <span className="text-sm font-semibold text-navy-900 dark:text-white">Total</span>
          <span className="text-2xl tabular font-bold text-navy-900 dark:text-white">
            {formatMoney(totals.total)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={onPark} disabled={empty}>
            <PauseCircle className="size-4" />
            Park
            <kbd className="ml-1 text-2xs text-slate-400 font-normal">F3</kbd>
          </Button>
          <Button variant="secondary" size="lg" onClick={onClear} disabled={empty}>
            <Trash2 className="size-4" />
            Void
          </Button>
        </div>

        <Button
          variant="accent"
          size="lg"
          className="w-full h-14 text-base font-bold"
          onClick={onPay}
          disabled={empty}
        >
          <CreditCard className="size-5" />
          Pay {formatMoney(totals.total)}
          <kbd className="ml-1 text-2xs opacity-80 font-normal">F2</kbd>
        </Button>
      </div>
    </aside>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={cn("tabular font-medium", tone === "success" ? "text-success" : "text-navy-900 dark:text-white")}>
        {value}
      </dd>
    </div>
  );
}
