"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Banknote, CreditCard, Smartphone, Printer, Lock, TrendingUp, TrendingDown, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { currentSession, sessionTotals, tenderTypes, type TenderType } from "@/data/pos";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICON: Record<TenderType, typeof Banknote> = {
  CASH: Banknote, CARD: CreditCard, EASYPAISA: Smartphone, JAZZCASH: Smartphone,
};

/**
 * X report (read the shift so far) and Z report (close it).
 *
 * The whole screen exists for one number: the variance between what the drawer
 * *should* hold and what the cashier actually counted. Everything else is the
 * evidence trail behind it.
 */
export default function CloseRegisterPage() {
  const router = useRouter();
  const [counted, setCounted] = React.useState("");
  const [closing, setClosing] = React.useState(false);

  const cashTakings = sessionTotals.byTender.find((t) => t.type === "CASH")?.amount ?? 0;
  const expectedCash =
    currentSession.openingFloat + cashTakings - sessionTotals.cashPaidOut - sessionTotals.refunds;

  const countedValue = counted === "" ? null : Number(counted) || 0;
  const variance = countedValue === null ? null : countedValue - expectedCash;
  const netSales = sessionTotals.grossSales - sessionTotals.refunds - sessionTotals.discounts;

  async function closeRegister() {
    setClosing(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Register closed", {
      description:
        variance === 0
          ? "Drawer balanced exactly. Z report filed."
          : `Z report filed with a ${formatMoney(Math.abs(variance ?? 0))} ${(variance ?? 0) > 0 ? "overage" : "shortage"}.`,
    });
    router.push("/pos/open");
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy-900 dark:text-white">Close register</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentSession.terminalCode} · {currentSession.cashier} · opened{" "}
              <span className="tabular">
                {new Date(currentSession.openedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Shift open</Badge>
            <Button
              variant="secondary"
              onClick={() => toast.info("X report", { description: "A read-only snapshot. The shift stays open and nothing is reset." })}
            >
              <Printer className="size-4" />
              Print X report
            </Button>
          </div>
        </header>

        {/* Shift summary */}
        <section aria-labelledby="summary-h" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <h2 id="summary-h" className="sr-only">Shift summary</h2>
          <Stat label="Sales" value={String(sessionTotals.sales)} sub={`${sessionTotals.returns} returns`} />
          <Stat label="Gross sales" value={formatMoney(sessionTotals.grossSales)} />
          <Stat label="Discounts given" value={`− ${formatMoney(sessionTotals.discounts)}`} tone="warning" />
          <Stat label="Net sales" value={formatMoney(netSales)} emphasis />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Tender breakdown */}
          <section
            aria-labelledby="tender-h"
            className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-navy-700">
              <h2 id="tender-h" className="text-sm font-bold text-navy-900 dark:text-white">Takings by tender</h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-navy-800">
              {sessionTotals.byTender.map((t) => {
                const Icon = ICON[t.type];
                return (
                  <li key={t.type} className="flex items-center gap-3 px-4 py-3">
                    <span className="size-9 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="size-4 text-slate-500 dark:text-slate-400" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900 dark:text-white">
                        {tenderTypes.find((x) => x.type === t.type)?.label}
                      </p>
                      <p className="text-2xs tabular text-slate-500 dark:text-slate-400">
                        {t.count} {t.count === 1 ? "transaction" : "transactions"}
                      </p>
                    </div>
                    <span className="text-sm tabular font-semibold text-navy-900 dark:text-white">
                      {formatMoney(t.amount)}
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-navy-950">
                <span className="text-sm font-bold text-navy-900 dark:text-white">Total taken</span>
                <span className="text-base tabular font-bold text-navy-900 dark:text-white">
                  {formatMoney(sessionTotals.byTender.reduce((s, t) => s + t.amount, 0))}
                </span>
              </li>
            </ul>
          </section>

          {/* Drawer count */}
          <section
            aria-labelledby="drawer-h"
            className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-navy-700">
              <h2 id="drawer-h" className="text-sm font-bold text-navy-900 dark:text-white">Cash drawer</h2>
            </div>

            <dl className="px-4 py-3 space-y-2 text-xs border-b border-slate-200 dark:border-navy-700">
              <DrawerRow label="Opening float" value={formatMoney(currentSession.openingFloat)} />
              <DrawerRow label="Cash sales" value={`+ ${formatMoney(cashTakings)}`} />
              <DrawerRow label="Refunds paid out" value={`− ${formatMoney(sessionTotals.refunds)}`} />
              <DrawerRow label="Cash paid out" value={`− ${formatMoney(sessionTotals.cashPaidOut)}`} />
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-navy-700">
                <dt className="text-sm font-semibold text-navy-900 dark:text-white">Expected in drawer</dt>
                <dd className="text-base tabular font-bold text-navy-900 dark:text-white">{formatMoney(expectedCash)}</dd>
              </div>
            </dl>

            <div className="px-4 py-4 space-y-3">
              <div>
                <label htmlFor="counted" className="block text-sm font-medium text-navy-900 dark:text-white mb-1.5">
                  Counted in drawer
                </label>
                <Input
                  id="counted"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                  placeholder="Count the cash, then enter the total"
                  className="h-12 text-lg tabular font-semibold"
                />
              </div>

              {variance !== null && (
                <div
                  role="status"
                  className={cn(
                    "rounded-lg border px-3 py-3 flex items-center gap-3",
                    variance === 0 && "border-success/30 bg-success/5",
                    variance > 0 && "border-info/30 bg-info/5",
                    variance < 0 && "border-danger/30 bg-danger/5"
                  )}
                >
                  {variance === 0 ? (
                    <CheckCircle2 className="size-5 text-success flex-shrink-0" aria-hidden />
                  ) : variance > 0 ? (
                    <TrendingUp className="size-5 text-info flex-shrink-0" aria-hidden />
                  ) : (
                    <TrendingDown className="size-5 text-danger flex-shrink-0" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        variance === 0 ? "text-success" : variance > 0 ? "text-info" : "text-danger"
                      )}
                    >
                      {variance === 0
                        ? "Drawer balances exactly"
                        : `${formatMoney(Math.abs(variance))} ${variance > 0 ? "over" : "short"}`}
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {variance === 0
                        ? "No variance to explain."
                        : "The variance is filed with the Z report against your name."}
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="accent"
                size="lg"
                className="w-full h-12"
                disabled={countedValue === null || closing}
                onClick={closeRegister}
              >
                <Lock className="size-4" />
                {closing ? "Closing…" : "Close register & print Z report"}
              </Button>
              <p className="text-2xs text-slate-500 dark:text-slate-400 text-center">
                Closing files the Z report and resets the shift. It cannot be reopened.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label, value, sub, tone, emphasis,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "warning";
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 bg-white dark:bg-navy-900",
        emphasis ? "border-brand/30" : "border-slate-200 dark:border-navy-700"
      )}
    >
      <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div
        className={cn(
          "text-xl tabular font-bold mt-1",
          tone === "warning" ? "text-warning" : "text-navy-900 dark:text-white"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="tabular font-medium text-navy-900 dark:text-white">{value}</dd>
    </div>
  );
}
