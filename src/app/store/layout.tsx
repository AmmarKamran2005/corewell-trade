import * as React from "react";
import type { Metadata } from "next";
import { BasketProvider } from "@/components/store/basket-provider";
import { StoreHeader, StoreFooter } from "@/components/store/store-chrome";
import { Toaster } from "@/components/ui/toaster";
import { demoTenant } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: `${demoTenant.name.split(" ")[0]} Store — mobile accessories`,
    template: `%s · ${demoTenant.name.split(" ")[0]} Store`,
  },
  description:
    "Consumer storefront running on the same catalogue, stock and ledger as the trade business.",
  /* Invented products at invented prices for a fictional company — this must
     never appear as a shopping result. */
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The storefront is the third channel and gets its own shell: no ERP sidebar,
 * no till chrome. Same design tokens so it still reads as one product family.
 *
 * `Suspense` wraps the header because it reads search params, which opts the
 * subtree into client-side rendering; without it the whole route would.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <div className="min-h-dvh flex flex-col bg-white dark:bg-navy-900">
        <React.Suspense fallback={<div className="h-[104px] border-b border-slate-200 dark:border-navy-800" />}>
          <StoreHeader />
        </React.Suspense>
        <main className="flex-1">{children}</main>
        <StoreFooter />
        <Toaster />
      </div>
    </BasketProvider>
  );
}
