"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Star, ShoppingBag, Truck, ShieldCheck, RotateCcw, Clock, Minus, Plus, ChevronRight, Barcode,
} from "lucide-react";
import { products, brands, categories, units } from "@/data/products";
import {
  retailPrice, compareAtPrice, stockPromise, productRating, deliveryMethods,
} from "@/data/store";
import { ProductThumb, ProductCard, StockBadge } from "@/components/store/product-card";
import { useBasket } from "@/components/store/basket-provider";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const product = products.find((p) => p.sku.toLowerCase() === decodeURIComponent(sku).toLowerCase());
  const { add } = useBasket();
  const [qty, setQty] = React.useState(1);

  if (!product) notFound();

  const price = retailPrice(product);
  const wasPrice = compareAtPrice(product);
  const promise = stockPromise(product);
  const rating = productRating(product);
  const brandName = brands.find((b) => b.id === product.brandId)?.name;
  const category = categories.find((c) => c.id === product.categoryId);
  const uom = units.find((u) => u.id === product.uomId);

  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isActive)
    .slice(0, 4);

  const maxQty = promise.state === "BACKORDER" ? 5 : Math.max(1, promise.available);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 mb-5">
        <Link href="/store" className="hover:text-brand">Store</Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link href="/store/products" className="hover:text-brand">Products</Link>
        {category && (
          <>
            <ChevronRight className="size-3" aria-hidden />
            <Link href={`/store/products?category=${category.id}`} className="hover:text-brand">{category.name}</Link>
          </>
        )}
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-navy-900 dark:text-white truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <ProductThumb product={product} className="aspect-square rounded-xl border border-slate-200 dark:border-navy-700" />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg border overflow-hidden",
                  i === 0 ? "border-brand" : "border-slate-200 dark:border-navy-700 opacity-60"
                )}
              >
                <ProductThumb product={product} className="aspect-square" />
              </div>
            ))}
          </div>
          <p className="text-2xs text-slate-400 dark:text-slate-500 mt-2 text-center">
            Product photography is not part of this demonstration catalogue.
          </p>
        </div>

        {/* Buy box */}
        <div>
          <p className="text-2xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">{brandName}</p>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-0.5" aria-label={`Rated ${rating.stars} out of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn("size-3.5", n <= Math.round(rating.stars) ? "text-warning fill-current" : "text-slate-300 dark:text-navy-600")}
                  aria-hidden
                />
              ))}
            </span>
            <span className="text-xs tabular text-slate-600 dark:text-slate-300">{rating.stars}</span>
            <span className="text-xs text-slate-400">({rating.count} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl tabular font-bold text-navy-900 dark:text-white">{formatMoney(price)}</span>
            {wasPrice && (
              <>
                <span className="text-sm tabular text-slate-400 line-through">{formatMoney(wasPrice)}</span>
                <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger text-2xs font-bold">
                  Save {formatMoney(wasPrice - price)}
                </span>
              </>
            )}
          </div>
          <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
            Price includes sales tax · per {uom?.name?.toLowerCase() ?? "unit"}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{product.description}</p>

          {/* Availability */}
          <div className="mt-5 rounded-lg border border-slate-200 dark:border-navy-700 p-3">
            <StockBadge product={product} />
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">{promise.despatch}</p>
            {promise.state === "BACKORDER" && (
              <p className="text-2xs text-info mt-1.5">
                Pre-order now — your order is reserved against the next inbound shipment and
                charged only when it ships.
              </p>
            )}
            {promise.state === "LOW" && (
              <p className="text-2xs text-warning mt-1.5">
                Stock is shared with our trade counters, so this can sell out quickly.
              </p>
            )}
          </div>

          {/* Quantity + add */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-navy-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                aria-label="Decrease quantity"
                className="size-12 inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <Minus className="size-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={maxQty}
                value={qty}
                onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
                aria-label="Quantity"
                className="w-14 h-12 text-center text-base tabular font-semibold bg-transparent text-navy-900 dark:text-white border-x border-slate-200 dark:border-navy-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setQty((v) => Math.min(maxQty, v + 1))}
                aria-label="Increase quantity"
                className="size-12 inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                add(product, qty);
                toast.success("Added to basket", { description: `${qty} × ${product.name}` });
              }}
              disabled={promise.state === "UNAVAILABLE"}
              className={cn(
                "flex-1 min-w-[200px] h-12 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                promise.state === "UNAVAILABLE"
                  ? "bg-slate-100 dark:bg-navy-700 text-slate-400 cursor-not-allowed"
                  : "bg-brand text-white hover:bg-brand-700"
              )}
            >
              {promise.state === "BACKORDER" ? (
                <><Clock className="size-4" aria-hidden /> Pre-order {formatMoney(price * qty)}</>
              ) : (
                <><ShoppingBag className="size-4" aria-hidden /> Add to basket · {formatMoney(price * qty)}</>
              )}
            </button>
          </div>
          {maxQty < 10 && promise.state !== "BACKORDER" && (
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-2">
              Maximum {maxQty} per order at current stock.
            </p>
          )}

          {/* Service promises */}
          <ul className="mt-6 space-y-2.5">
            {deliveryMethods.map((d) => (
              <li key={d.code} className="flex items-start gap-2.5 text-xs">
                <Truck className="size-3.5 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden />
                <span className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-navy-900 dark:text-white">{d.name}</span> — {d.eta},{" "}
                  {d.fee === 0 ? "free" : formatMoney(d.fee)}
                  {d.freeOver ? ` (free over ${formatMoney(d.freeOver)})` : ""}
                </span>
              </li>
            ))}
            <li className="flex items-start gap-2.5 text-xs">
              <ShieldCheck className="size-3.5 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span className="text-slate-600 dark:text-slate-300">
                <span className="font-medium text-navy-900 dark:text-white">12-month warranty</span> — serial
                number recorded at despatch, so a claim needs no receipt.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-xs">
              <RotateCcw className="size-3.5 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span className="text-slate-600 dark:text-slate-300">
                <span className="font-medium text-navy-900 dark:text-white">14-day returns</span> — unused and
                in original packaging.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Specification */}
      <section aria-labelledby="spec-h" className="mt-12 max-w-3xl">
        <h2 id="spec-h" className="text-lg font-bold text-navy-900 dark:text-white">Specification</h2>
        <dl className="mt-4 rounded-xl border border-slate-200 dark:border-navy-700 divide-y divide-slate-100 dark:divide-navy-800">
          <SpecRow label="Product code" value={product.sku} mono />
          <SpecRow label="Brand" value={brandName ?? "—"} />
          <SpecRow label="Category" value={category?.name ?? "—"} />
          <SpecRow label="Sold as" value={uom?.name ?? "—"} />
          <SpecRow
            label="Barcode"
            value={product.barcodes[0] ?? "—"}
            mono
            icon={<Barcode className="size-3.5 text-slate-400" aria-hidden />}
          />
          <SpecRow label="Warranty" value="12 months against manufacturing defects" />
        </dl>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-h" className="mt-12">
          <h2 id="related-h" className="text-lg font-bold text-navy-900 dark:text-white">More in {category?.name}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecRow({
  label, value, mono, icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <dt className="text-xs text-slate-500 dark:text-slate-400 w-36 flex-shrink-0">{label}</dt>
      <dd className={cn("text-sm text-navy-900 dark:text-white flex items-center gap-2", mono && "tabular")}>
        {icon}
        {value}
      </dd>
    </div>
  );
}
