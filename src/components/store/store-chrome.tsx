"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, User, Truck, ShieldCheck, RotateCcw, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { brand, demoTenant } from "@/lib/brand";
import { storeCollections } from "@/data/store";
import { categories } from "@/data/products";
import { useBasket } from "@/components/store/basket-provider";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Header ─────────────────────────────── */

export function StoreHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const { lines, ready } = useBasket();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [q, setQ] = React.useState(params.get("q") ?? "");

  const count = lines.reduce((s, l) => s + l.qty, 0);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/store/products?q=${encodeURIComponent(q.trim())}` : "/store/products");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-navy-950/95 backdrop-blur border-b border-slate-200 dark:border-navy-800">
      {/* Reassurance strip — the three questions every first-time buyer asks */}
      <div className="bg-navy-900 text-slate-300 text-2xs">
        <div className="max-w-6xl mx-auto px-4 h-8 flex items-center gap-5 overflow-x-auto scrollbar-thin">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="size-3 text-brand-300" aria-hidden />
            Free standard delivery over PKR 5,000
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <RotateCcw className="size-3 text-brand-300" aria-hidden />
            14-day returns
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="size-3 text-brand-300" aria-hidden />
            12-month warranty on every product
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="md:hidden size-11 -ml-2 inline-flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="/store" className="flex items-center gap-2.5 flex-shrink-0">
          <BrandMark size={30} />
          <span className="min-w-0">
            <span className="block text-base font-bold leading-none text-navy-900 dark:text-white">
              {demoTenant.name.split(" ")[0]}
              <span className="text-brand"> Store</span>
            </span>
            <span className="hidden sm:block text-2xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              Mobile accessories, direct
            </span>
          </span>
        </Link>

        <form onSubmit={submitSearch} className="hidden md:block flex-1 max-w-md relative">
          <label htmlFor="store-search" className="sr-only">Search products</label>
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
          <input
            id="store-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search earbuds, chargers, cables…"
            className="w-full h-11 pl-9 pr-3 rounded-full bg-slate-100 dark:bg-navy-900 border border-transparent text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-navy-900 focus:border-brand transition-colors"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/store/orders"
            className={cn(
              "h-11 px-3 inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/store/orders")
                ? "text-brand"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            )}
          >
            <User className="size-4" />
            <span className="hidden sm:inline">My orders</span>
          </Link>

          <Link
            href="/store/cart"
            className="relative h-11 px-3 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Basket</span>
            {ready && count > 0 && (
              <span
                className="absolute top-1.5 right-1.5 sm:static min-w-[20px] h-5 px-1.5 rounded-full bg-brand text-white text-2xs font-bold tabular inline-flex items-center justify-center"
                aria-label={`${count} items in basket`}
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category bar */}
      <nav
        aria-label="Product categories"
        className={cn(
          "border-t border-slate-200 dark:border-navy-800 md:block",
          menuOpen ? "block" : "hidden"
        )}
      >
        <div className="max-w-6xl mx-auto px-4">
          <form onSubmit={submitSearch} className="md:hidden py-3 relative">
            <label htmlFor="store-search-m" className="sr-only">Search products</label>
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
            <input
              id="store-search-m"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full h-11 pl-9 pr-3 rounded-full bg-slate-100 dark:bg-navy-900 border border-transparent text-sm text-navy-900 dark:text-white focus:outline-none focus:border-brand"
            />
          </form>

          <ul className="flex md:items-center gap-1 flex-col md:flex-row pb-3 md:pb-0 md:overflow-x-auto scrollbar-thin">
            <li>
              <Link
                href="/store/products"
                className="h-11 px-3 inline-flex items-center rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 whitespace-nowrap"
                onClick={() => setMenuOpen(false)}
              >
                All products
              </Link>
            </li>
            {storeCollections.map((c) => (
              <li key={c.categoryId}>
                <Link
                  href={`/store/products?category=${c.categoryId}`}
                  className="h-11 px-3 inline-flex items-center rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 whitespace-nowrap"
                  onClick={() => setMenuOpen(false)}
                >
                  {categories.find((x) => x.id === c.categoryId)?.name ?? c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

/* ─────────────────────────── Footer ─────────────────────────────── */

export function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="text-sm font-bold text-navy-900 dark:text-white">
              {demoTenant.name.split(" ")[0]}<span className="text-brand"> Store</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            The consumer storefront of {demoTenant.name} — the same catalogue and
            the same stock as its trade counters.
          </p>
        </div>

        <FooterCol
          title="Shop"
          links={[
            { label: "All products", href: "/store/products" },
            { label: "New arrivals", href: "/store/products?sort=new" },
            { label: "Best sellers", href: "/store/products?sort=popular" },
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            { label: "Track an order", href: "/store/orders" },
            { label: "Delivery & returns", href: "/store/help" },
            { label: "Warranty", href: "/store/help" },
          ]}
        />
        <FooterCol
          title="Business"
          links={[
            { label: "Trade & wholesale", href: "/dashboard" },
            { label: "Store counters", href: "/pos" },
          ]}
        />
      </div>

      <div className="border-t border-slate-200 dark:border-navy-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-2xs text-slate-500 dark:text-slate-400">
          <p>
            Storefront powered by{" "}
            <span className="font-semibold text-navy-900 dark:text-white">{brand.product}</span> —{" "}
            <a href={brand.companyUrl} target="_blank" rel="noopener noreferrer" className="text-brand font-medium hover:underline">
              {brand.company}
            </a>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            Demonstration system — sample data, no real orders are fulfilled
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="inline-flex items-center min-h-[36px] py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-brand">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
