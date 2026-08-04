"use client";

import * as React from "react";
import { ScanLine, PauseCircle, UserPlus, X } from "lucide-react";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { TenderDialog } from "@/components/pos/tender-dialog";
import { ParkedDialog } from "@/components/pos/parked-dialog";
import { ReceiptDialog } from "@/components/pos/receipt-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { products, categories } from "@/data/products";
import { parties } from "@/data/parties";
import { parkedSales as seededParked, currentSession, type ParkedSale } from "@/data/pos";
import {
  addProduct, computeTotals, findByScan, searchCatalogue, setLineDiscount, setQty,
  type CartLine, type Tender,
} from "@/lib/pos-cart";
import { cn } from "@/lib/utils";

const WALK_IN = "Walk-in customer";
const ACCOUNT_CUSTOMERS = parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");

export default function TillPage() {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [orderDiscount, setOrderDiscount] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [customerName, setCustomerName] = React.useState(WALK_IN);
  const [parked, setParked] = React.useState<ParkedSale[]>(seededParked);

  const [tenderOpen, setTenderOpen] = React.useState(false);
  const [parkedOpen, setParkedOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<{
    no: string; lines: CartLine[]; tenders: Tender[]; change: number;
  } | null>(null);

  const scanRef = React.useRef<HTMLInputElement>(null);
  const totals = computeTotals(lines, orderDiscount);

  const visible = React.useMemo(() => {
    const byCategory = categoryId
      ? products.filter((p) => p.categoryId === categoryId)
      : products;
    return searchCatalogue(byCategory, query);
  }, [query, categoryId]);

  const inCart = React.useMemo(
    () => Object.fromEntries(lines.map((l) => [l.productId, l.qty])),
    [lines]
  );

  /* ── Scanning ──────────────────────────────────────────────────
     A barcode scanner types the code then presses Enter. An exact
     barcode/SKU match is added straight to the cart; anything else
     stays in the box as a text filter. */
  function onScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hit = findByScan(products, query);
    if (hit) {
      addToCart(hit);
      setQuery("");
      return;
    }
    if (visible.length === 1) {
      addToCart(visible[0]);
      setQuery("");
      return;
    }
    if (visible.length === 0) {
      toast.error("No match", { description: `Nothing in the catalogue matches “${query}”.` });
    }
  }

  function addToCart(p: (typeof products)[number]) {
    if (p.totalStock <= 0) {
      toast.error("Out of stock", { description: `${p.name} has no sellable stock.` });
      return;
    }
    setLines((l) => addProduct(l, p));
  }

  function clearSale() {
    setLines([]);
    setOrderDiscount(0);
    setCustomerName(WALK_IN);
    scanRef.current?.focus();
  }

  function parkSale() {
    if (lines.length === 0) return;
    const ref = `PARK-${String(32 + parked.length).padStart(4, "0")}`;
    setParked((list) => [
      {
        id: Date.now(),
        reference: ref,
        customerName,
        parkedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        itemCount: totals.itemCount,
        total: totals.total,
        note: "Parked at the till",
        lineProductIds: lines.map((l) => l.productId),
      },
      ...list,
    ]);
    toast.success("Sale parked", { description: `Recall it as ${ref} when the customer returns.` });
    clearSale();
  }

  function recallSale(sale: ParkedSale) {
    let next: CartLine[] = [];
    for (const id of sale.lineProductIds) {
      const p = products.find((x) => x.id === id);
      if (p) next = addProduct(next, p);
    }
    setLines(next);
    setCustomerName(sale.customerName);
    setParked((list) => list.filter((s) => s.id !== sale.id));
    setParkedOpen(false);
    toast.success("Sale recalled", { description: `${sale.reference} is back in the cart.` });
  }

  function completeSale(tenders: Tender[], change: number) {
    const no = `${currentSession.terminalCode}-26-${String(4129 + parked.length).padStart(6, "0")}`;
    setReceipt({ no, lines, tenders, change });
    setTenderOpen(false);
  }

  /* ── Keyboard-first operation ─────────────────────────────────
     Counter staff work with one hand on a scanner and one on the
     keyboard; the mouse is the slow path. */
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F2") { e.preventDefault(); if (lines.length) setTenderOpen(true); }
      else if (e.key === "F3") { e.preventDefault(); parkSale(); }
      else if (e.key === "F4") { e.preventDefault(); setParkedOpen(true); }
      else if (e.key === "Escape" && !tenderOpen && !parkedOpen && !receipt) {
        if (query) setQuery("");
        else scanRef.current?.focus();
      } else if (e.key === "/" && document.activeElement !== scanRef.current) {
        e.preventDefault();
        scanRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  React.useEffect(() => { scanRef.current?.focus(); }, []);

  return (
    <div className="h-full flex flex-col lg:flex-row min-h-0">
      {/* ── Catalogue ───────────────────────────────────────────── */}
      <section aria-label="Catalogue" className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Scan / search */}
        <div className="flex-shrink-0 p-3 sm:p-4 pb-0">
          <form onSubmit={onScanSubmit} className="relative">
            <label htmlFor="scan" className="sr-only">Scan a barcode or search the catalogue</label>
            <ScanLine className="size-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand pointer-events-none" aria-hidden />
            <input
              id="scan"
              ref={scanRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Scan barcode or search by name / SKU…"
              autoComplete="off"
              className="w-full h-14 pl-11 pr-24 rounded-xl bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-700 text-base text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand focus:shadow-glow-brand transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); scanRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="size-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-700 hover:text-navy-900 dark:hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-6 items-center rounded border border-slate-200 dark:border-navy-600 px-1.5 text-2xs text-slate-400">/</kbd>
            </div>
          </form>
        </div>

        {/* Category filter */}
        <div className="flex-shrink-0 px-3 sm:px-4 pt-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1" role="group" aria-label="Filter by category">
            <FilterChip active={categoryId === null} onClick={() => setCategoryId(null)}>
              All products
            </FilterChip>
            {categories.filter((c) => c.productCount > 0).map((c) => (
              <FilterChip key={c.id} active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
                {c.name}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Tiles */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <ProductGrid products={visible} onPick={addToCart} inCart={inCart} />
        </div>

        {/* Status strip: customer + parked + shortcuts */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 sm:px-4 py-2 flex flex-wrap items-center gap-2">
          <label htmlFor="customer" className="sr-only">Customer for this sale</label>
          <div className="relative">
            <UserPlus className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
            <select
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 pl-8 pr-7 rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-xs text-navy-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:border-brand"
            >
              <option value={WALK_IN}>{WALK_IN}</option>
              {ACCOUNT_CUSTOMERS.map((c) => (
                <option key={c.id} value={c.displayName}>{c.displayName}</option>
              ))}
            </select>
          </div>

          <Button variant="secondary" size="md" onClick={() => setParkedOpen(true)}>
            <PauseCircle className="size-4" />
            Parked
            {parked.length > 0 && (
              <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-2xs font-bold tabular inline-flex items-center justify-center">
                {parked.length}
              </span>
            )}
            <kbd className="ml-1 text-2xs text-slate-400 font-normal">F4</kbd>
          </Button>

          <p className="ml-auto hidden md:flex items-center gap-3 text-2xs text-slate-500 dark:text-slate-400">
            <Shortcut k="/">Search</Shortcut>
            <Shortcut k="F2">Pay</Shortcut>
            <Shortcut k="F3">Park</Shortcut>
            <Shortcut k="F4">Recall</Shortcut>
            <Shortcut k="Esc">Clear</Shortcut>
          </p>
        </div>
      </section>

      {/* ── Cart ────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 h-[46%] lg:h-full border-t lg:border-t-0 border-slate-200 dark:border-navy-700">
        <CartPanel
          lines={lines}
          totals={totals}
          customerName={customerName}
          orderDiscountPercent={orderDiscount}
          onQtyChange={(id, qty) => setLines((l) => setQty(l, id, qty))}
          onRemove={(id) => setLines((l) => l.filter((x) => x.productId !== id))}
          onLineDiscount={(id, pct) => setLines((l) => setLineDiscount(l, id, pct))}
          onOrderDiscount={(pct) => setOrderDiscount(Math.min(100, Math.max(0, pct)))}
          onPark={parkSale}
          onClear={clearSale}
          onPay={() => setTenderOpen(true)}
        />
      </div>

      <TenderDialog
        open={tenderOpen}
        onOpenChange={setTenderOpen}
        total={totals.total}
        onComplete={completeSale}
      />

      <ParkedDialog
        open={parkedOpen}
        onOpenChange={setParkedOpen}
        sales={parked}
        onRecall={recallSale}
        onDiscard={(s) => {
          setParked((list) => list.filter((x) => x.id !== s.id));
          toast.success("Parked sale discarded", { description: `${s.reference} removed.` });
        }}
      />

      {receipt && (
        <ReceiptDialog
          open
          onOpenChange={(v) => { if (!v) { setReceipt(null); clearSale(); } }}
          receiptNo={receipt.no}
          lines={receipt.lines}
          totals={totals}
          tenders={receipt.tenders}
          change={receipt.change}
          onNewSale={() => { setReceipt(null); clearSale(); }}
        />
      )}
    </div>
  );
}

function FilterChip({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 px-3.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active
          ? "bg-navy-900 text-brand-300 dark:bg-brand dark:text-white"
          : "bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-500"
      )}
    >
      {children}
    </button>
  );
}

function Shortcut({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="inline-flex h-5 items-center rounded border border-slate-200 dark:border-navy-600 px-1.5 text-2xs tabular">
        {k}
      </kbd>
      {children}
    </span>
  );
}
