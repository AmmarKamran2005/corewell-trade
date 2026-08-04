"use client";

import * as React from "react";
import { Package, Ban } from "lucide-react";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Catalogue tiles. Sized for a fingertip on a counter touchscreen (well past
 * the 44px minimum) and stock-aware: an out-of-stock tile says so in words and
 * with an icon, not only by looking dimmer.
 */
export function ProductGrid({
  products,
  onPick,
  inCart,
}: {
  products: Product[];
  onPick: (p: Product) => void;
  inCart: Record<number, number>;
}) {
  if (products.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <div className="size-12 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mb-3">
          <Package className="size-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-navy-900 dark:text-white">Nothing matches that search</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Try a shorter word, a SKU, or scan the barcode on the box.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-2.5 p-3 sm:p-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))" }}
    >
      {products.map((p) => {
        const out = p.totalStock <= 0;
        const qty = inCart[p.id] ?? 0;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            disabled={out}
            aria-label={`${p.name}, ${formatMoney(p.salePrice)}${out ? ", out of stock" : ""}`}
            className={cn(
              "group relative min-h-[112px] p-3 rounded-xl text-left flex flex-col",
              "bg-white dark:bg-navy-800 border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-navy-950",
              out
                ? "border-slate-200 dark:border-navy-700 opacity-60 cursor-not-allowed"
                : "border-slate-200 dark:border-navy-700 hover:border-brand hover:bg-brand-50/60 dark:hover:bg-navy-700 active:scale-[0.98]",
              qty > 0 && !out && "border-brand ring-1 ring-brand/30"
            )}
          >
            {qty > 0 && (
              <span
                className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand text-white text-2xs font-bold tabular flex items-center justify-center"
                aria-label={`${qty} in cart`}
              >
                {qty}
              </span>
            )}

            <span className="text-xs font-medium text-navy-900 dark:text-white leading-snug line-clamp-2 pr-6">
              {p.name}
            </span>

            <span className="mt-auto pt-2">
              <span className="block text-2xs tabular text-slate-400 dark:text-slate-500">{p.sku}</span>
              <span className="flex items-baseline justify-between gap-2 mt-0.5">
                <span className="text-sm tabular font-bold text-navy-900 dark:text-white">
                  {formatMoney(p.salePrice)}
                </span>
                {out ? (
                  <span className="inline-flex items-center gap-1 text-2xs font-semibold text-danger">
                    <Ban className="size-3" aria-hidden />
                    Out
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-2xs tabular font-medium",
                      p.status === "low" ? "text-warning" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {p.totalStock} left
                  </span>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
