"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { products, categories, brands } from "@/data/products";
import { retailPrice, stockPromise, isNewArrival, bestSellerIds } from "@/data/store";
import { ProductCard } from "@/components/store/product-card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "popular" | "new" | "price-asc" | "price-desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most popular" },
  { key: "new", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export default function Catalogue() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const categoryId = params.get("category") ? Number(params.get("category")) : null;
  const brandId = params.get("brand") ? Number(params.get("brand")) : null;
  const sort = (params.get("sort") as SortKey) ?? "popular";
  const inStockOnly = params.get("stock") === "1";

  const [filtersOpen, setFiltersOpen] = React.useState(false);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    router.replace(`/store/products?${next.toString()}`, { scroll: false });
  }

  const popular = bestSellerIds();

  const results = React.useMemo(() => {
    let list = products.filter((p) => p.isActive);

    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle)
      );
    }
    if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
    if (brandId) list = list.filter((p) => p.brandId === brandId);
    if (inStockOnly) list = list.filter((p) => stockPromise(p).state !== "BACKORDER");

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => retailPrice(a) - retailPrice(b));
    else if (sort === "price-desc") sorted.sort((a, b) => retailPrice(b) - retailPrice(a));
    else if (sort === "new") sorted.sort((a, b) => Number(isNewArrival(b)) - Number(isNewArrival(a)) || b.id - a.id);
    else sorted.sort((a, b) => {
      const ai = popular.indexOf(a.id), bi = popular.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return sorted;
  }, [q, categoryId, brandId, sort, inStockOnly, popular]);

  const activeFilters = [
    categoryId && { key: "category", label: categories.find((c) => c.id === categoryId)?.name ?? "Category" },
    brandId && { key: "brand", label: brands.find((b) => b.id === brandId)?.name ?? "Brand" },
    inStockOnly && { key: "stock", label: "In stock only" },
    q && { key: "q", label: `“${q}”` },
  ].filter(Boolean) as { key: string; label: string }[];

  const priceRange = results.length
    ? { min: Math.min(...results.map(retailPrice)), max: Math.max(...results.map(retailPrice)) }
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
            {categoryId ? categories.find((c) => c.id === categoryId)?.name : q ? `Results for “${q}”` : "All products"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {results.length} {results.length === 1 ? "product" : "products"}
            {priceRange && ` · ${formatMoney(priceRange.min)} – ${formatMoney(priceRange.max)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="lg:hidden h-11 px-4 rounded-lg border border-slate-200 dark:border-navy-700 text-sm font-medium text-navy-900 dark:text-white inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
          </button>

          <label htmlFor="sort" className="sr-only">Sort products</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-11 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-sm text-navy-900 dark:text-white cursor-pointer focus:outline-none focus:border-brand"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </header>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setParam(f.key, null)}
              className="h-8 pl-3 pr-2 rounded-full bg-brand-50 dark:bg-brand/15 text-brand-700 dark:text-brand-300 text-2xs font-semibold inline-flex items-center gap-1.5 hover:bg-brand-100 dark:hover:bg-brand/25"
            >
              {f.label}
              <X className="size-3" aria-hidden />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.replace("/store/products", { scroll: false })}
            className="h-8 px-2 text-2xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[220px_1fr] gap-8 mt-6">
        {/* Filters */}
        <aside
          aria-label="Filters"
          className={cn("lg:block", filtersOpen ? "block" : "hidden")}
        >
          <FilterGroup title="Category">
            {categories
              .filter((c) => c.productCount > 0)
              .map((c) => (
                <FilterRow
                  key={c.id}
                  label={c.name}
                  count={products.filter((p) => p.categoryId === c.id && p.isActive).length}
                  checked={categoryId === c.id}
                  onChange={() => setParam("category", categoryId === c.id ? null : String(c.id))}
                />
              ))}
          </FilterGroup>

          <FilterGroup title="Brand">
            {brands.filter((b) => b.isActive).map((b) => (
              <FilterRow
                key={b.id}
                label={b.name}
                count={products.filter((p) => p.brandId === b.id && p.isActive).length}
                checked={brandId === b.id}
                onChange={() => setParam("brand", brandId === b.id ? null : String(b.id))}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Availability">
            <FilterRow
              label="In stock only"
              checked={inStockOnly}
              onChange={() => setParam("stock", inStockOnly ? null : "1")}
            />
          </FilterGroup>
        </aside>

        {/* Results */}
        <div>
          {results.length === 0 ? (
            <div className="py-16 text-center">
              <div className="size-12 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-3">
                <PackageSearch className="size-5 text-slate-400" aria-hidden />
              </div>
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">No products match</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try removing a filter, or search for a broader term like “charger”.
              </p>
              <button
                type="button"
                onClick={() => router.replace("/store/products", { scroll: false })}
                className="mt-4 h-11 px-5 rounded-lg bg-brand text-white text-sm font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pb-5 mb-5 border-b border-slate-200 dark:border-navy-800 last:border-0">
      <h2 className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
        {title}
      </h2>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function FilterRow({
  label, count, checked, onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 min-h-[36px] px-1 -mx-1 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-slate-300 dark:border-navy-600 text-brand focus:ring-2 focus:ring-brand"
      />
      <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{label}</span>
      {count != null && <span className="text-2xs tabular text-slate-400">{count}</span>}
    </label>
  );
}

