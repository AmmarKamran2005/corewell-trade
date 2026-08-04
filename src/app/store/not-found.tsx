import Link from "next/link";
import { PackageSearch, ArrowRight } from "lucide-react";

/**
 * Scoped to the storefront so a mistyped SKU keeps the shop chrome and offers a
 * way back into the catalogue, instead of dropping the shopper on a bare error.
 */
export default function StoreNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="size-14 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
        <PackageSearch className="size-6 text-slate-400" aria-hidden />
      </div>
      <h1 className="text-xl font-bold text-navy-900 dark:text-white">We couldn’t find that page</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
        The product may have been discontinued, or the link may be out of date.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        <Link
          href="/store/products"
          className="h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-700"
        >
          Browse all products
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          href="/store"
          className="h-12 px-6 rounded-lg border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white text-sm font-semibold inline-flex items-center hover:bg-slate-50 dark:hover:bg-navy-800"
        >
          Back to the store
        </Link>
      </div>
    </div>
  );
}
