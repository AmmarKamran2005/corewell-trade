"use client";

import * as React from "react";
import { Banknote, CreditCard, Smartphone, Trash2, Check, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import { cashDenominations, tenderTypes, type TenderType } from "@/data/pos";
import { balanceDue, changeDue, tenderedTotal, type Tender } from "@/lib/pos-cart";
import { cn } from "@/lib/utils";

const TENDER_ICON: Record<TenderType, typeof Banknote> = {
  CASH: Banknote,
  CARD: CreditCard,
  EASYPAISA: Smartphone,
  JAZZCASH: Smartphone,
};

/**
 * Split tender: a customer pays 2,000 cash and the rest on card, and the till
 * has to hold both. The dialog is driven by the outstanding balance — every
 * amount entry defaults to "whatever is still owed", because that is the
 * overwhelmingly common case and it saves a keystroke on every sale.
 */
export function TenderDialog({
  open,
  onOpenChange,
  total,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  total: number;
  onComplete: (tenders: Tender[], change: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-3xl">
        {/* Radix unmounts the content when the dialog closes, so the tender
            state below starts empty for every sale without a reset effect. */}
        <TenderBody total={total} onCancel={() => onOpenChange(false)} onComplete={onComplete} />
      </DialogContent>
    </Dialog>
  );
}

function TenderBody({
  total,
  onCancel,
  onComplete,
}: {
  total: number;
  onCancel: () => void;
  onComplete: (tenders: Tender[], change: number) => void;
}) {
  const [tenders, setTenders] = React.useState<Tender[]>([]);
  const [active, setActive] = React.useState<TenderType>("CASH");
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const amountRef = React.useRef<HTMLInputElement>(null);

  const due = balanceDue(total, tenders);
  const change = changeDue(total, tenders);
  const settled = due <= 0;
  const meta = tenderTypes.find((t) => t.type === active)!;

  function addTender(value: number, ref?: string) {
    if (!value || value <= 0) return;
    setTenders((t) => [
      ...t,
      { id: `${active}-${t.length}-${value}`, type: active, amount: value, reference: ref || undefined },
    ]);
    setAmount("");
    setReference("");
    amountRef.current?.focus();
  }

  function submitAmount(e: React.FormEvent) {
    e.preventDefault();
    /* The field is typed in major units; everything downstream is minor. */
    const value = amount ? Math.round(Number(amount) * 100) : due > 0 ? due : 0;
    if (meta.needsReference && !reference.trim()) return;
    if (meta.needsReference && value > due) {
      /* Non-cash cannot over-tender — a card terminal charges an exact amount. */
      addTender(due, reference);
      return;
    }
    addTender(value, reference);
  }

  const referenceMissing = meta.needsReference && !reference.trim();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Take payment</DialogTitle>
        <DialogDescription>
          Add one or more tenders until the balance is settled.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-4">
          {/* Running figures — the number the cashier reads out loud */}
          <div className="grid grid-cols-3 gap-3">
            <Figure label="Total" value={formatMoney(total)} />
            <Figure label="Tendered" value={formatMoney(tenderedTotal(tenders))} />
            {change > 0 ? (
              <Figure label="Change due" value={formatMoney(change)} tone="success" emphasis />
            ) : (
              <Figure label="Balance due" value={formatMoney(Math.max(0, due))} tone={due > 0 ? "warning" : "success"} emphasis />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: choose method + amount */}
            <div className="space-y-3">
              <fieldset>
                <legend className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Method
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {tenderTypes.map((t) => {
                    const Icon = TENDER_ICON[t.type];
                    const isActive = active === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => { setActive(t.type); setReference(""); amountRef.current?.focus(); }}
                        aria-pressed={isActive}
                        className={cn(
                          "min-h-[52px] px-3 py-2 rounded-lg border text-left transition-colors flex items-center gap-2.5",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                          isActive
                            ? "border-brand bg-brand-50 dark:bg-brand/15"
                            : "border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-500"
                        )}
                      >
                        <Icon className={cn("size-4 flex-shrink-0", isActive ? "text-brand" : "text-slate-400")} />
                        <span className="min-w-0">
                          <span className={cn("block text-sm font-medium", isActive ? "text-brand-700 dark:text-brand-300" : "text-navy-900 dark:text-white")}>
                            {t.label}
                          </span>
                          <span className="block text-2xs text-slate-500 dark:text-slate-400 truncate">{t.hint}</span>
                        </span>
                        {isActive && <Check className="size-4 text-brand ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <form onSubmit={submitAmount} className="space-y-3">
                <div>
                  <label htmlFor="tender-amount" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Amount
                  </label>
                  <Input
                    id="tender-amount"
                    ref={amountRef}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={amount}
                    autoFocus
                    placeholder={due > 0 ? (due / 100).toFixed(2) : "0.00"}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 text-lg tabular font-semibold"
                  />
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                    Leave blank to tender the full balance due.
                  </p>
                </div>

                {meta.givesChange && (
                  <div className="flex flex-wrap gap-2">
                    {cashDenominations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setAmount((d / 100).toFixed(2))}
                        className="h-11 px-3 rounded-lg border border-slate-200 dark:border-navy-700 text-sm tabular font-medium text-navy-900 dark:text-white hover:border-brand hover:bg-brand-50 dark:hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {formatMoney(d, { decimals: 0 })}
                      </button>
                    ))}
                    {due > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount((due / 100).toFixed(2))}
                        className="h-11 px-3 rounded-lg border border-brand bg-brand-50 dark:bg-brand/15 text-sm tabular font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        Exact
                      </button>
                    )}
                  </div>
                )}

                {meta.needsReference && (
                  <div>
                    <label htmlFor="tender-ref" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Reference <span className="text-danger">*</span>
                    </label>
                    <Input
                      id="tender-ref"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder={active === "CARD" ? "Last 4 digits" : "Transaction ID"}
                      aria-invalid={referenceMissing && amount !== ""}
                      className="h-11"
                    />
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                      Needed to match this payment during bank reconciliation.
                    </p>
                  </div>
                )}

                <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={settled || referenceMissing}>
                  Add {meta.label.toLowerCase()} tender
                </Button>
              </form>
            </div>

            {/* Right: what has been taken so far */}
            <div className="rounded-lg border border-slate-200 dark:border-navy-700 flex flex-col min-h-[260px]">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-navy-700">
                <h3 className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  Tenders on this sale
                </h3>
              </div>
              {tenders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <Banknote className="size-6 text-slate-300 dark:text-navy-600 mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nothing taken yet. The full {formatMoney(total)} is outstanding.
                  </p>
                </div>
              ) : (
                <ul className="flex-1 divide-y divide-slate-100 dark:divide-navy-800 overflow-y-auto scrollbar-thin">
                  {tenders.map((t, i) => {
                    const Icon = TENDER_ICON[t.type];
                    return (
                      <li key={t.id} className="flex items-center gap-2.5 px-3 py-2.5">
                        <Icon className="size-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-navy-900 dark:text-white">
                            {tenderTypes.find((x) => x.type === t.type)?.label}
                          </p>
                          {t.reference && (
                            <p className="text-2xs tabular text-slate-500 dark:text-slate-400 truncate">
                              Ref {t.reference}
                            </p>
                          )}
                        </div>
                        <span className="text-sm tabular font-semibold text-navy-900 dark:text-white">
                          {formatMoney(t.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTenders((list) => list.filter((_, idx) => idx !== i))}
                          aria-label={`Remove ${t.type.toLowerCase()} tender of ${formatMoney(t.amount)}`}
                          className="size-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-danger/10 hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {due > 0 && tenders.length > 0 && (
                <p className="flex items-start gap-1.5 px-3 py-2 text-2xs text-warning border-t border-slate-200 dark:border-navy-700">
                  <AlertCircle className="size-3.5 flex-shrink-0 mt-px" aria-hidden />
                  {formatMoney(due)} still to collect before this sale can complete.
                </p>
              )}
            </div>
          </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="accent"
          size="lg"
          disabled={!settled}
          onClick={() => onComplete(tenders, change)}
        >
          <Check className="size-4" />
          {change > 0 ? `Complete · ${formatMoney(change)} change` : "Complete sale"}
        </Button>
      </DialogFooter>
    </>
  );
}

function Figure({
  label, value, tone, emphasis,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        emphasis && tone === "success" && "border-success/30 bg-success/5",
        emphasis && tone === "warning" && "border-warning/30 bg-warning/5",
        !emphasis && "border-slate-200 dark:border-navy-700"
      )}
    >
      <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div
        className={cn(
          "text-xl tabular font-bold mt-0.5",
          tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-navy-900 dark:text-white"
        )}
      >
        {value}
      </div>
    </div>
  );
}
