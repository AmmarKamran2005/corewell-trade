"use client";

import * as React from "react";
import { CheckCircle2, Printer, Mail, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogBody, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/format";
import { brand, demoTenant } from "@/lib/brand";
import { currentSession, tenderTypes } from "@/data/pos";
import { type CartLine, type CartTotals, lineNet, type Tender } from "@/lib/pos-cart";

/**
 * Post-sale confirmation. The change owed is the largest thing on screen —
 * it is the one number the cashier must act on before anything else.
 */
export function ReceiptDialog({
  open,
  onOpenChange,
  receiptNo,
  lines,
  totals,
  tenders,
  change,
  onNewSale,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  receiptNo: string;
  lines: CartLine[];
  totals: CartTotals;
  tenders: Tender[];
  change: number;
  onNewSale: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" showClose={false}>
        <DialogBody className="pt-6">
          <div className="text-center">
            <div className="size-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="size-6 text-success" />
            </div>
            {/* Radix needs a real DialogTitle here, otherwise the dialog is
                announced to a screen reader with no name at all. */}
            <DialogTitle className="text-lg font-bold">Sale complete</DialogTitle>
            <DialogDescription className="text-2xs tabular mt-0.5">{receiptNo}</DialogDescription>
          </div>

          {change > 0 && (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-center">
              <div className="text-2xs uppercase font-semibold tracking-wider text-success">Change due</div>
              <div className="text-3xl tabular font-bold text-success mt-0.5">{formatMoney(change)}</div>
            </div>
          )}

          {/* Receipt preview — narrow column, mimicking an 80mm roll */}
          <div className="mt-4 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 p-4 max-h-64 overflow-y-auto scrollbar-thin">
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-navy-700">
              <p className="text-sm font-bold text-navy-900 dark:text-white">{demoTenant.name}</p>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                {currentSession.terminalCode} · {currentSession.cashier}
              </p>
            </div>

            <ul className="py-2 space-y-1.5">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-start gap-2 text-2xs">
                  <span className="tabular text-slate-500 dark:text-slate-400 w-8 flex-shrink-0">{l.qty} ×</span>
                  <span className="flex-1 min-w-0 text-navy-900 dark:text-white truncate">{l.name}</span>
                  <span className="tabular text-navy-900 dark:text-white">{formatMoney(lineNet(l))}</span>
                </li>
              ))}
            </ul>

            <dl className="pt-2 border-t border-dashed border-slate-300 dark:border-navy-700 space-y-1 text-2xs">
              <ReceiptRow label="Subtotal" value={formatMoney(totals.netSubtotal)} />
              <ReceiptRow label="Sales tax" value={formatMoney(totals.tax)} />
              <ReceiptRow label="Total" value={formatMoney(totals.total)} bold />
              {tenders.map((t, i) => (
                <ReceiptRow
                  key={i}
                  label={tenderTypes.find((x) => x.type === t.type)?.label ?? t.type}
                  value={formatMoney(t.amount)}
                />
              ))}
              {change > 0 && <ReceiptRow label="Change" value={formatMoney(change)} />}
            </dl>

            <p className="text-center text-2xs text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-navy-700">
              {brand.product} — {brand.company}
            </p>
          </div>
        </DialogBody>

        <DialogFooter className="grid grid-cols-2 sm:flex sm:justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => toast.info("Printing is not wired up in the demo", { description: "A deployed till prints to the counter's thermal printer." })}
            >
              <Printer className="size-4" />
              Print
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("Email is disabled in the demo", { description: "No message leaves this environment." })}
            >
              <Mail className="size-4" />
              Email
            </Button>
          </div>
          <Button variant="accent" size="lg" onClick={onNewSale} autoFocus>
            <Plus className="size-4" />
            New sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className={bold ? "font-bold text-navy-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}>{label}</dt>
      <dd className={`tabular ${bold ? "font-bold text-navy-900 dark:text-white" : "text-navy-900 dark:text-white"}`}>{value}</dd>
    </div>
  );
}
