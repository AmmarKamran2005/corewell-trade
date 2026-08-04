import { Suspense } from "react";
import Catalogue from "@/components/store/catalogue";

export const metadata = { title: "All products" };

/**
 * Server component by design. The catalogue reads `useSearchParams`, which
 * forces its subtree to render on the client — keeping the Suspense boundary
 * here, above the client module, lets everything around it prerender. Putting
 * the boundary *inside* a "use client" page renders the whole tree twice.
 */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-500 dark:text-slate-400">
          Loading products…
        </div>
      }
    >
      <Catalogue />
    </Suspense>
  );
}
