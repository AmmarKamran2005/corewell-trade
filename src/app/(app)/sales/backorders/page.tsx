"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, TruckElectric, AlertTriangle, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toaster";
import { products } from "@/data/products";
import { backorders, stockPromise, retailPrice, type Backorder } from "@/data/store";
import { formatCompact, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * What the business owes and has not yet shipped.
 *
 * Picking short raises a backorder rather than cancelling a line, which is the
 * honest answer to a customer — but it only stays honest if someone can see the
 * queue and release it when stock lands. Without this page the promise made at
 * the pick face is a promise nobody is holding.
 */
export default function BackordersPage() {
  const [released, setReleased] = React.useState<number[]>([]);

  const open = backorders.filter((b) => !released.includes(b.id));
  const value = open.reduce((s, b) => {
    const p = products.find((x) => x.id === b.productId);
    return s + (p ? retailPrice(p) * b.qty : 0);
  }, 0);
  const unsourced = open.filter((b) => !b.expectedFromPo);

  function release(b: Backorder) {
    setReleased((r) => [...r, b.id]);
    toast.success("Released to picking", {
      description: `${b.qty} × ${b.name} added to the fulfilment queue for ${b.orderNo}.`,
    });
  }

  /** Stock that has arrived since the shortfall — the trigger to release. */
  function coverage(b: Backorder) {
    const p = products.find((x) => x.id === b.productId);
    if (!p) return { available: 0, covered: false };
    const available = stockPromise(p).available;
    return { available, covered: available >= b.qty };
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Sales", href: "/sales/orders" }, { label: "Backorders" }]}
        title="Backorders"
        subtitle="Lines promised to customers but not yet shipped"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Open lines</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{open.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Owed to customers</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(value)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Ready to release</div>
          <div className="text-2xl tabular font-bold text-success mt-1">
            {open.filter((b) => coverage(b).covered).length}
          </div>
        </Card>
        <Card className={unsourced.length ? "p-4 border-warning/30 bg-warning/5" : "p-4"}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">No inbound PO</div>
              <div className="text-2xl tabular font-bold text-warning mt-1">{unsourced.length}</div>
            </div>
            <AlertTriangle className="size-5 text-warning" aria-hidden />
          </div>
        </Card>
      </div>

      {unsourced.length > 0 && (
        <Card className="mb-6">
          <CardBody className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-warning flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {unsourced.length} {unsourced.length === 1 ? "line has" : "lines have"} no purchase
              order behind {unsourced.length === 1 ? "it" : "them"}. Nothing is on its way, so the
              date given to the customer is currently a guess — raise a PO or contact them.
            </p>
          </CardBody>
        </Card>
      )}

      {open.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="Nothing on backorder"
          description="Every promised line has been shipped or released to picking."
        />
      ) : (
        <ul className="space-y-3">
          {open.map((b) => {
            const { available, covered } = coverage(b);
            return (
              <li
                key={b.id}
                className={cn(
                  "rounded-xl border bg-white dark:bg-navy-900 p-4",
                  covered ? "border-success/40" : "border-slate-200 dark:border-navy-700"
                )}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/sales/online-orders/${b.orderNo}`}
                        className="text-sm tabular font-semibold text-navy-900 dark:text-white hover:text-brand"
                      >
                        {b.orderNo}
                      </Link>
                      <span className="text-2xs text-slate-500 dark:text-slate-400">{b.customerName}</span>
                      <Badge variant={covered ? "success" : "warning"}>
                        {covered ? "Stock available" : "Waiting on stock"}
                      </Badge>
                    </div>
                    <p className="text-sm text-navy-900 dark:text-white mt-1.5">
                      <span className="tabular font-semibold">{b.qty} ×</span> {b.name}
                    </p>
                    <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">
                      {b.sku} · raised {formatDate(b.raisedAt)} · {available} now available online
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                      Inbound
                    </p>
                    {b.expectedFromPo ? (
                      <>
                        <Link
                          href="/purchases/orders"
                          className="block text-sm tabular font-medium text-brand hover:underline"
                        >
                          {b.expectedFromPo}
                        </Link>
                        <p className="text-2xs tabular text-slate-500 dark:text-slate-400">
                          due {b.expectedDate ? formatDate(b.expectedDate) : "—"}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-warning">Not on order</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={covered ? "accent" : "secondary"}
                      size="md"
                      disabled={!covered}
                      onClick={() => release(b)}
                      title={covered ? undefined : "Not enough stock to release this line yet"}
                    >
                      <TruckElectric className="size-4" />
                      Release to picking
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {released.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5" aria-hidden />
          {released.length} {released.length === 1 ? "line" : "lines"} released this session.
        </p>
      )}
    </>
  );
}
