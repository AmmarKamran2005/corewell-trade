"use client";

import * as React from "react";
import { Search, Receipt as ReceiptIcon, RotateCcw, AlertCircle, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectNative } from "@/components/ui/select-native";
import { toast } from "@/components/ui/toaster";
import {
  receipts, returnReasons, returnConditions, tenderTypes,
  type Receipt, type ReturnReason, type ReturnCondition,
} from "@/data/pos";
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ReturnLine = {
  productId: number;
  qty: number;
  condition: ReturnCondition;
};

/**
 * Counter returns are always against a receipt. A blind refund — no receipt, no
 * original line — is how a till leaks money, so the flow starts with a lookup
 * and never allows returning more than was sold.
 */
export default function ReturnsPage() {
  const [query, setQuery] = React.useState("");
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);
  const [selected, setSelected] = React.useState<ReturnLine[]>([]);
  const [reason, setReason] = React.useState<ReturnReason>(returnReasons[0]);
  const [processing, setProcessing] = React.useState(false);

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (r) => r.receiptNo.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q)
    );
  }, [query]);

  const refundTotal = React.useMemo(() => {
    if (!receipt) return 0;
    return selected.reduce((s, sel) => {
      const line = receipt.lines.find((l) => l.productId === sel.productId);
      return s + (line ? line.unitPrice * sel.qty : 0);
    }, 0);
  }, [receipt, selected]);

  function pickReceipt(r: Receipt) {
    setReceipt(r);
    setSelected([]);
  }

  function setLineQty(productId: number, qty: number) {
    setSelected((list) => {
      const without = list.filter((l) => l.productId !== productId);
      if (qty <= 0) return without;
      const existing = list.find((l) => l.productId === productId);
      return [...without, { productId, qty, condition: existing?.condition ?? "RESALABLE" }];
    });
  }

  function setLineCondition(productId: number, condition: ReturnCondition) {
    setSelected((list) =>
      list.map((l) => (l.productId === productId ? { ...l, condition } : l))
    );
  }

  async function processReturn() {
    if (!receipt) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 700));
    const damaged = selected.filter((l) => l.condition === "DAMAGED").length;
    toast.success("Refund processed", {
      description: `${formatMoney(refundTotal)} refunded to ${
        tenderTypes.find((t) => t.type === receipt.tender)?.label
      }${damaged ? ` · ${damaged} line${damaged > 1 ? "s" : ""} sent to damaged goods` : ""}.`,
    });
    setReceipt(null);
    setSelected([]);
    setQuery("");
    setProcessing(false);
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <header>
          <h1 className="text-xl font-bold text-navy-900 dark:text-white">Counter returns</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find the original receipt, choose the lines coming back, and refund to the tender used.
          </p>
        </header>

        {/* Step 1 — find the receipt */}
        <section
          aria-labelledby="lookup-h"
          className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-4"
        >
          <h2 id="lookup-h" className="text-sm font-bold text-navy-900 dark:text-white mb-3">
            1 · Find the receipt
          </h2>

          <div className="relative">
            <label htmlFor="receipt-search" className="sr-only">Search by receipt number or customer</label>
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
            <input
              id="receipt-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Scan the receipt or type its number / customer…"
              autoComplete="off"
              className="w-full h-12 pl-10 pr-3 rounded-lg bg-transparent border border-slate-200 dark:border-navy-700 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand"
            />
          </div>

          <ul className="mt-3 space-y-2">
            {matches.length === 0 && (
              <li className="py-6 text-center">
                <ReceiptIcon className="size-6 text-slate-300 dark:text-navy-600 mx-auto mb-2" aria-hidden />
                <p className="text-sm text-slate-500 dark:text-slate-400">No receipt matches that search.</p>
              </li>
            )}
            {matches.map((r) => {
              const active = receipt?.id === r.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => pickReceipt(r)}
                    aria-pressed={active}
                    className={cn(
                      "w-full text-left rounded-lg border px-3 py-3 flex flex-wrap items-center gap-3 transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      active
                        ? "border-brand bg-brand-50 dark:bg-brand/10"
                        : "border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-500"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm tabular font-semibold text-navy-900 dark:text-white">{r.receiptNo}</p>
                      <p className="text-2xs text-slate-500 dark:text-slate-400">
                        {formatDate(r.soldAt)} · {r.cashier} · {r.customerName}
                      </p>
                    </div>
                    <Badge variant="muted">{tenderTypes.find((t) => t.type === r.tender)?.label}</Badge>
                    <span className="text-sm tabular font-bold text-navy-900 dark:text-white">
                      {formatMoney(r.total)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Step 2 — choose lines */}
        {receipt && (
          <section
            aria-labelledby="lines-h"
            className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-4"
          >
            <h2 id="lines-h" className="text-sm font-bold text-navy-900 dark:text-white mb-3">
              2 · What is coming back?
            </h2>

            <ul className="space-y-2">
              {receipt.lines.map((l) => {
                const returnable = l.qty - l.alreadyReturned;
                const sel = selected.find((s) => s.productId === l.productId);
                const exhausted = returnable <= 0;
                return (
                  <li
                    key={l.productId}
                    className={cn(
                      "rounded-lg border p-3",
                      exhausted
                        ? "border-slate-200 dark:border-navy-700 opacity-60"
                        : sel
                          ? "border-brand/50"
                          : "border-slate-200 dark:border-navy-700"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">{l.name}</p>
                        <p className="text-2xs tabular text-slate-500 dark:text-slate-400">
                          {l.sku} · sold {l.qty} @ {formatMoney(l.unitPrice)}
                          {l.alreadyReturned > 0 && (
                            <span className="text-warning font-medium"> · {l.alreadyReturned} already returned</span>
                          )}
                        </p>
                      </div>

                      {exhausted ? (
                        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-slate-500 dark:text-slate-400">
                          <AlertCircle className="size-3.5" aria-hidden />
                          Fully returned
                        </span>
                      ) : (
                        <>
                          <div>
                            <label htmlFor={`qty-${l.productId}`} className="block text-2xs text-slate-500 dark:text-slate-400 mb-1">
                              Return qty (max {returnable})
                            </label>
                            <input
                              id={`qty-${l.productId}`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={returnable}
                              value={sel?.qty ?? ""}
                              placeholder="0"
                              onChange={(e) =>
                                setLineQty(l.productId, Math.min(returnable, Math.max(0, Number(e.target.value))))
                              }
                              className="w-20 h-11 px-2 text-center text-sm tabular font-semibold rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-navy-900 dark:text-white focus:outline-none focus:border-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>

                          <div>
                            <label htmlFor={`cond-${l.productId}`} className="block text-2xs text-slate-500 dark:text-slate-400 mb-1">
                              Condition
                            </label>
                            <SelectNative
                              id={`cond-${l.productId}`}
                              value={sel?.condition ?? "RESALABLE"}
                              disabled={!sel}
                              onChange={(e) => setLineCondition(l.productId, e.target.value as ReturnCondition)}
                              className="h-11 w-40"
                            >
                              {returnConditions.map((c) => (
                                <option key={c.value} value={c.value}>{c.label} — {c.hint}</option>
                              ))}
                            </SelectNative>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Step 3 — reason and refund */}
        {receipt && selected.length > 0 && (
          <section
            aria-labelledby="refund-h"
            className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-4 space-y-4"
          >
            <h2 id="refund-h" className="text-sm font-bold text-navy-900 dark:text-white">
              3 · Reason and refund
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-navy-900 dark:text-white mb-1.5">
                  Reason <span className="text-danger">*</span>
                </label>
                <SelectNative
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReturnReason)}
                  className="h-11"
                >
                  {returnReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </SelectNative>
                <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Reason codes are what make return patterns reportable later.
                </p>
              </div>

              <div className="rounded-lg border border-brand/30 bg-brand-50/60 dark:bg-brand/10 px-4 py-3">
                <div className="text-2xs uppercase font-semibold tracking-wider text-brand-700 dark:text-brand-300">
                  Refund to {tenderTypes.find((t) => t.type === receipt.tender)?.label}
                </div>
                <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-0.5">
                  {formatMoney(refundTotal)}
                </div>
                <p className="text-2xs text-slate-600 dark:text-slate-300 mt-1">
                  Refunds go back to the tender used on the original sale.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="secondary" size="lg" onClick={() => { setReceipt(null); setSelected([]); }}>
                <Undo2 className="size-4" />
                Cancel
              </Button>
              <Button variant="accent" size="lg" onClick={processReturn} disabled={processing}>
                <RotateCcw className="size-4" />
                {processing ? "Processing…" : `Refund ${formatMoney(refundTotal)}`}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
