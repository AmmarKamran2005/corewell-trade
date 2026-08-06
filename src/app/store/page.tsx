import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Store } from "lucide-react";
import { products, categories } from "@/data/products";
import { storeCollections, bestSellerIds, isNewArrival } from "@/data/store";
import { ProductCard, ProductThumb } from "@/components/store/product-card";
import { demoTenant } from "@/lib/brand";

export default function StoreHomePage() {
  const bestSellers = bestSellerIds()
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const newArrivals = products.filter((p) => p.isActive && isNewArrival(p)).slice(0, 4);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand-700 dark:text-brand-300 text-2xs font-semibold uppercase tracking-wider">
              <Store className="size-3" aria-hidden />
              Direct from the distributor
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900 dark:text-white mt-4 leading-[1.15]">
              Accessories that keep up with your phone.
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-4 max-w-md leading-relaxed">
              Earbuds, power banks, chargers and cables — stocked in our own
              warehouses and shipped the same day across the region.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/store/products"
                className="h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Shop all products
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/store/products?sort=popular"
                className="h-12 px-6 rounded-lg border border-slate-300 dark:border-navy-600 text-navy-900 dark:text-white text-sm font-semibold inline-flex items-center hover:bg-white dark:hover:bg-navy-800 transition-colors"
              >
                Best sellers
              </Link>
            </div>
          </div>

          {/* A collage of real catalogue items rather than stock photography */}
          <div className="grid grid-cols-3 gap-3">
            {bestSellers.slice(0, 6).map((p, i) => (
              <Link
                key={p.id}
                href={`/store/products/${p.sku}`}
                className="rounded-xl overflow-hidden border border-slate-200 dark:border-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={p.name}
              >
                <ProductThumb product={p} className={i === 0 ? "aspect-square" : "aspect-square"} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promises ─────────────────────────────────────────────── */}
      <section aria-label="Why buy here" className="border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Promise icon={Truck} title="Same-day despatch" body="Order before 4pm on any in-stock item." />
          <Promise icon={ShieldCheck} title="12-month warranty" body="Serial-tracked from our warehouse to you." />
          <Promise icon={RotateCcw} title="14-day returns" body="Unused and in its packaging, no questions." />
        </div>
      </section>

      {/* ── Collections ──────────────────────────────────────────── */}
      <section aria-labelledby="collections-h" className="max-w-6xl mx-auto px-4 py-12">
        <h2 id="collections-h" className="text-xl font-bold text-navy-900 dark:text-white">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          {storeCollections.map((c) => {
            const cat = categories.find((x) => x.id === c.categoryId);
            const sample = products.find((p) => p.categoryId === c.categoryId);
            return (
              <Link
                key={c.categoryId}
                href={`/store/products?category=${c.categoryId}`}
                className="group rounded-xl border border-slate-200 dark:border-navy-700 overflow-hidden hover:border-brand/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {sample && <ProductThumb product={sample} className="aspect-[3/2]" />}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-navy-900 dark:text-white group-hover:text-brand">
                    {cat?.name ?? c.title}
                  </h3>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{c.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Best sellers ─────────────────────────────────────────── */}
      <section aria-labelledby="best-h" className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-end justify-between gap-3">
          <h2 id="best-h" className="text-xl font-bold text-navy-900 dark:text-white">Best sellers</h2>
          <Link href="/store/products?sort=popular" className="h-11 inline-flex items-center px-2 -mr-2 text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {bestSellers.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── New arrivals ─────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section aria-labelledby="new-h" className="max-w-6xl mx-auto px-4 pb-4">
          <div className="flex items-end justify-between gap-3">
            <h2 id="new-h" className="text-xl font-bold text-navy-900 dark:text-white">New arrivals</h2>
            <Link href="/store/products?sort=new" className="h-11 inline-flex items-center px-2 -mr-2 text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Trade cross-sell ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Buying for a shop?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl">
              {demoTenant.name} supplies retailers across the region on trade terms
              and credit accounts. Wholesale pricing is a different price list on
              the same catalogue you are browsing.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="h-11 px-5 rounded-lg border border-navy-300 dark:border-navy-600 text-navy-900 dark:text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-white dark:hover:bg-navy-800 transition-colors whitespace-nowrap"
          >
            Open the trade system
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function Promise({
  icon: Icon, title, body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="size-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
        <Icon className="size-4 text-brand" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-navy-900 dark:text-white">{title}</h3>
        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{body}</p>
      </div>
    </div>
  );
}
