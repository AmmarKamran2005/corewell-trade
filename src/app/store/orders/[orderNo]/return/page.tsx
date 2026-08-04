"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { products } from "@/data/products";
import {
  onlineOrders, storeReturnReasons, RETURN_WINDOW_DAYS, paymentMethods,
  type StoreReturnReason,
} from "@/data/store";
import { ProductThumb } from "@/components/store/product-card";
import { toast } from "@/components/ui/toaster";
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Customer-initiated return.
 *
 * The header promises 14-day returns; this is where that promise is actually
 * honoured. It mirrors the counter-returns rule from the till: a return is
 * always against real order lines, never a free-floating refund request.
 */
export default function ReturnRequestPage() {
  const router = useRouter();
  const { orderNo } = useParams<{ orderNo: string }>();
  const order = onlineOrders.find((o) => o.orderNo === decodeURIComponent(orderNo));

  const [qtys, setQtys] = React.useState<Record<number, number>>({});
  const [reason, setReason] = React.useState<StoreReturnReason>(storeReturnReasons[0]);
  const [note, setNote] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-navy-900 dark:text-white">Order not found</h1>
        <Link href="/store/orders" className="mt-6 inline-flex h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold items-center">
          Back to my orders
        </Link>
      </div>
    );
  }

  const eligible = order.state === "DELIVERED";
  const selected = Object.entries(qtys).filter(([, q]) => q > 0);
  const refund = selected.reduce((s, [pid, q]) => {
    const line = order.lines.find((l) => l.productId === Number(pid));
    return s + (line ? line.unitPrice * q : 0);
  }, 0);
  const payment = paymentMethods.find((p) => p.code === order.paymentCode);
  const nothingSelected = selected.length === 0;
  const orderNumber = order.orderNo;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (nothingSelected) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Return requested", {
      description: `We’ll email a collection label for ${selected.length} ${selected.length === 1 ? "item" : "items"}.`,
    });
    router.push(`/store/orders/${orderNumber}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/store/orders/${order.orderNo}`} className="inline-flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 hover:text-brand mb-5">
        <ChevronLeft className="size-3.5" aria-hidden />
        Back to order
      </Link>

      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Return an item</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 tabular">
        {order.orderNo} · delivered {formatDate(order.placedAt)}
      </p>

      {!eligible ? (
        <div role="status" className="mt-6 rounded-xl border border-warning/30 bg-warning/5 px-4 py-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-warning flex-shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-warning">This order hasn’t arrived yet</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              You can start a return once the order is delivered. If something is wrong
              before then, you can still cancel it from the order page.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6 space-y-6">
          <section aria-labelledby="items-h" className="rounded-xl border border-slate-200 dark:border-navy-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-navy-700">
              <h2 id="items-h" className="text-sm font-bold text-navy-900 dark:text-white">
                1 · What are you sending back?
              </h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-navy-800">
              {order.lines.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                const q = qtys[l.productId] ?? 0;
                return (
                  <li key={l.productId} className="p-4 flex flex-wrap items-center gap-4">
                    {p && <ProductThumb product={p} className="size-14 rounded-lg flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900 dark:text-white">{l.name}</p>
                      <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">
                        {l.qty} bought · {formatMoney(l.unitPrice)} each
                      </p>
                    </div>
                    <div>
                      <label htmlFor={`ret-${l.productId}`} className="block text-2xs text-slate-500 dark:text-slate-400 mb-1">
                        Return qty
                      </label>
                      <input
                        id={`ret-${l.productId}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={l.qty}
                        value={q || ""}
                        placeholder="0"
                        onChange={(e) =>
                          setQtys((prev) => ({
                            ...prev,
                            [l.productId]: Math.min(l.qty, Math.max(0, Number(e.target.value) || 0)),
                          }))
                        }
                        className="w-20 h-11 px-2 text-center text-sm tabular font-semibold rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-navy-900 dark:text-white focus:outline-none focus:border-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            {touched && nothingSelected && (
              <p role="alert" className="px-4 py-3 border-t border-slate-200 dark:border-navy-700 text-2xs text-danger">
                Choose at least one item to return.
              </p>
            )}
          </section>

          <section aria-labelledby="reason-h" className="rounded-xl border border-slate-200 dark:border-navy-700 p-4 space-y-4">
            <h2 id="reason-h" className="text-sm font-bold text-navy-900 dark:text-white">2 · Why?</h2>

            <fieldset>
              <legend className="sr-only">Reason for return</legend>
              <div className="space-y-2">
                {storeReturnReasons.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[48px]",
                      reason === r ? "border-brand bg-brand-50/60 dark:bg-brand/10" : "border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-500"
                    )}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="size-4 text-brand focus:ring-2 focus:ring-brand"
                    />
                    <span className="text-sm text-navy-900 dark:text-white">{r}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="note" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Anything else? <span className="font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us what happened — it helps us sort the collection out faster."
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-transparent text-sm text-navy-900 dark:text-white focus:outline-none focus:border-brand"
              />
            </div>
          </section>

          <section className="rounded-xl border border-brand/30 bg-brand-50/60 dark:bg-brand/10 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-navy-900 dark:text-white">Refund estimate</span>
              <span className="text-2xl tabular font-bold text-navy-900 dark:text-white">{formatMoney(refund)}</span>
            </div>
            <p className="text-2xs text-slate-600 dark:text-slate-300 mt-1.5">
              Refunded to {payment?.name} once we receive and check the items. Faulty and
              wrongly-sent items are collected free; change-of-mind returns are sent back
              at your own cost. Window: {RETURN_WINDOW_DAYS} days from delivery.
            </p>
          </section>

          <div className="flex flex-wrap gap-2 justify-end">
            <Link
              href={`/store/orders/${order.orderNo}`}
              className="h-12 px-5 rounded-lg border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white text-sm font-semibold inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={sending}
              className="h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-700 disabled:opacity-60"
            >
              {sending ? "Sending…" : <><RotateCcw className="size-4" aria-hidden /> Request return</>}
            </button>
          </div>
        </form>
      )}

      {eligible && (
        <p className="mt-6 flex items-start gap-2 text-2xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="size-3.5 flex-shrink-0 mt-px text-slate-400" aria-hidden />
          Nothing is actually collected or refunded — this is a demonstration system.
        </p>
      )}
    </div>
  );
}
