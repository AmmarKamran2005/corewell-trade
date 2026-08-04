"use client";

import * as React from "react";
import { PauseCircle, Clock, User, RotateCcw } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { ParkedSale } from "@/data/pos";

/**
 * Parked sales. A counter queue does not stop because one customer went back to
 * the car for cash — the sale is set aside by reference and recalled later.
 */
export function ParkedDialog({
  open,
  onOpenChange,
  sales,
  onRecall,
  onDiscard,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sales: ParkedSale[];
  onRecall: (sale: ParkedSale) => void;
  onDiscard: (sale: ParkedSale) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Parked sales</DialogTitle>
          <DialogDescription>
            Recall a sale to bring its items back into the cart.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {sales.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="size-12 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mb-3">
                <PauseCircle className="size-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-navy-900 dark:text-white">Nothing parked</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Press F3 during a sale to set it aside and serve the next customer.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {sales.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-slate-200 dark:border-navy-700 p-3 flex flex-wrap items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular font-semibold text-navy-900 dark:text-white">{s.reference}</span>
                      <span className="inline-flex items-center gap-1 text-2xs text-slate-500 dark:text-slate-400">
                        <Clock className="size-3" aria-hidden />
                        {s.parkedAt}
                      </span>
                      <span className="inline-flex items-center gap-1 text-2xs text-slate-500 dark:text-slate-400">
                        <User className="size-3" aria-hidden />
                        {s.customerName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.note}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm tabular font-bold text-navy-900 dark:text-white">{formatMoney(s.total)}</div>
                    <div className="text-2xs tabular text-slate-500 dark:text-slate-400">
                      {s.itemCount} {s.itemCount === 1 ? "item" : "items"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onDiscard(s)}>
                      Discard
                    </Button>
                    <Button variant="accent" size="md" onClick={() => onRecall(s)}>
                      <RotateCcw className="size-4" />
                      Recall
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
