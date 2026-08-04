"use client";

import * as React from "react";
import Link from "next/link";
import { Star, ShoppingBag, Clock } from "lucide-react";
import type { Product } from "@/data/products";
import { brands } from "@/data/products";
import { retailPrice, compareAtPrice, stockPromise, productRating, isNewArrival } from "@/data/store";
import { formatMoney } from "@/lib/format";
import { useBasket } from "@/components/store/basket-provider";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

/**
 * Product artwork is generated from the SKU rather than shipped as an image:
 * the demo has no photography, and a grid of identical grey placeholders reads
 * worse than a deliberate, stable colour treatment.
 */
export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  const hue = (product.id * 47) % 360;
  const initials = product.name
    .replace(/^Nortex\s+/, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn("relative overflow-hidden flex items-center justify-center", className)}
      style={{
        /* Explicit colour as well as the gradient: the gradient is a
           background-image, so anything reading background-color — contrast
           tooling, forced-colours mode — would otherwise see the page behind. */
        backgroundColor: `hsl(${hue} 32% 92%)`,
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 32% 92%), hsl(${(hue + 40) % 360} 28% 84%))`,
      }}
      aria-hidden
    >
      <span className="text-2xl font-bold tracking-tight" style={{ color: `hsl(${hue} 30% 32%)` }}>
        {initials}
      </span>
    </div>
  );
}

export function StockBadge({ product, className }: { product: Product; className?: string }) {
  const promise = stockPromise(product);
  const map = {
    IN_STOCK: { text: "In stock", tone: "text-success" },
    LOW: { text: `Only ${promise.available} left`, tone: "text-warning" },
    BACKORDER: { text: "Backorder", tone: "text-info" },
    UNAVAILABLE: { text: "Unavailable", tone: "text-slate-500 dark:text-slate-400" },
  } as const;
  const m = map[promise.state];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-2xs font-semibold", m.tone, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {m.text}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useBasket();
  const price = retailPrice(product);
  const wasPrice = compareAtPrice(product);
  const promise = stockPromise(product);
  const rating = productRating(product);
  const brandName = brands.find((b) => b.id === product.brandId)?.name;

  return (
    <article className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 overflow-hidden transition-colors hover:border-brand/50">
      <Link href={`/store/products/${product.sku}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-t-xl">
        <ProductThumb product={product} className="aspect-[4/3]" />
      </Link>

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {wasPrice && (
          <span className="px-2 py-0.5 rounded-full bg-danger-dark text-white text-2xs font-bold">
            Save {Math.round(((wasPrice - price) / wasPrice) * 100)}%
          </span>
        )}
        {isNewArrival(product) && (
          <span className="px-2 py-0.5 rounded-full bg-navy-900 text-brand-300 text-2xs font-bold">New</span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-2xs text-slate-500 dark:text-slate-400">{brandName}</p>
        <h3 className="text-sm font-medium text-navy-900 dark:text-white leading-snug mt-0.5">
          <Link href={`/store/products/${product.sku}`} className="hover:text-brand focus-visible:outline-none focus-visible:underline">
            {/* Stretches the link over the card without trapping the button */}
            <span className="line-clamp-2">{product.name}</span>
          </Link>
        </h3>

        <div className="flex items-center gap-1 mt-1.5">
          <Star className="size-3 text-warning fill-current" aria-hidden />
          <span className="text-2xs tabular text-slate-600 dark:text-slate-300">{rating.stars}</span>
          <span className="text-2xs text-slate-400 dark:text-slate-500">({rating.count})</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base tabular font-bold text-navy-900 dark:text-white">{formatMoney(price)}</span>
            {wasPrice && (
              <span className="text-2xs tabular text-slate-400 line-through">{formatMoney(wasPrice)}</span>
            )}
          </div>
          <StockBadge product={product} className="mt-1" />

          <button
            type="button"
            onClick={() => {
              add(product);
              toast.success("Added to basket", { description: product.name });
            }}
            disabled={promise.state === "UNAVAILABLE"}
            className={cn(
              "mt-2.5 w-full h-11 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-navy-800",
              promise.state === "UNAVAILABLE"
                ? "bg-slate-100 dark:bg-navy-700 text-slate-400 cursor-not-allowed"
                : promise.state === "BACKORDER"
                  ? "border border-brand text-brand hover:bg-brand-50 dark:hover:bg-brand/10"
                  : "bg-brand text-white hover:bg-brand-700"
            )}
          >
            {promise.state === "BACKORDER" ? (
              <><Clock className="size-4" aria-hidden /> Pre-order</>
            ) : (
              <><ShoppingBag className="size-4" aria-hidden /> Add to basket</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
