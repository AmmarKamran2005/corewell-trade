import type { Metadata } from "next";
import { PosTopBar } from "@/components/pos/pos-top-bar";
import { Toaster } from "@/components/ui/toaster";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Point of Sale",
  description: `Counter till for ${brand.product}.`,
  /* Sample sales against invented customers — the landing page is the only
     page here that belongs in a search result. */
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The till runs in its own shell — no ERP sidebar, no page scroll. The screen
 * is a fixed workspace: chrome on top, catalogue and cart filling the rest.
 */
export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-slate-100 dark:bg-navy-950">
      <PosTopBar />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      <Toaster />
    </div>
  );
}
