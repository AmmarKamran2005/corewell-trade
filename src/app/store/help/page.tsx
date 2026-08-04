import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Store, CreditCard, ChevronRight } from "lucide-react";
import { deliveryMethods, paymentMethods, RETURN_WINDOW_DAYS, storeReturnReasons } from "@/data/store";
import { formatMoney } from "@/lib/format";
import { demoTenant } from "@/lib/brand";

export const metadata = { title: "Delivery, returns & warranty" };

/**
 * The three things the header strip promises, spelled out.
 *
 * A storefront that advertises "14-day returns" in its chrome and has nowhere
 * explaining what that means is making a claim it cannot answer questions about.
 */
export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 mb-5">
        <Link href="/store" className="hover:text-brand">Store</Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-navy-900 dark:text-white">Delivery, returns &amp; warranty</span>
      </nav>

      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Delivery, returns &amp; warranty</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
        Everything {demoTenant.name} promises at checkout, in plain terms.
      </p>

      {/* Delivery */}
      <section aria-labelledby="delivery-h" className="mt-8">
        <h2 id="delivery-h" className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-white">
          <Truck className="size-4 text-brand" aria-hidden />
          Delivery
        </h2>
        <div className="mt-3 rounded-xl border border-slate-200 dark:border-navy-700 divide-y divide-slate-100 dark:divide-navy-800">
          {deliveryMethods.map((d) => (
            <div key={d.code} className="p-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="text-sm font-semibold text-navy-900 dark:text-white w-40">{d.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex-1 min-w-[180px]">
                {d.eta} · {d.note}
              </p>
              <p className="text-sm tabular font-semibold text-navy-900 dark:text-white">
                {d.fee === 0 ? "Free" : formatMoney(d.fee)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3">
          Standard delivery is free on orders over {formatMoney(5000)}. Orders placed
          before 4pm on an in-stock item are despatched the same working day. If part of
          your order is on backorder, the in-stock part ships first and the rest follows —
          you are never charged delivery twice.
        </p>
      </section>

      {/* Returns */}
      <section aria-labelledby="returns-h" className="mt-8">
        <h2 id="returns-h" className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-white">
          <RotateCcw className="size-4 text-brand" aria-hidden />
          Returns
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
          You have <span className="font-semibold text-navy-900 dark:text-white">{RETURN_WINDOW_DAYS} days</span> from
          delivery to return an item. It must be unused and in its original packaging.
          Start a return from the order itself — no phone call needed.
        </p>
        <ul className="mt-3 grid sm:grid-cols-2 gap-2">
          {storeReturnReasons.map((r) => (
            <li key={r} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-navy-700 px-3 py-2">
              <span aria-hidden className="size-1.5 rounded-full bg-brand flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3">
          Faulty and wrongly-sent items are collected at our cost. Change-of-mind returns
          are sent back at your own cost. Refunds go to the payment method used on the
          original order.
        </p>
        <Link href="/store/orders" className="mt-4 inline-flex h-11 items-center gap-2 px-5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-700">
          Start a return
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </section>

      {/* Warranty */}
      <section aria-labelledby="warranty-h" className="mt-8">
        <h2 id="warranty-h" className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-white">
          <ShieldCheck className="size-4 text-brand" aria-hidden />
          Warranty
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
          Every product carries a 12-month warranty against manufacturing defects.
          Higher-value items are serial-numbered when they leave our warehouse and the
          serial is recorded against your order — so a claim needs no receipt, just the
          order number.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Physical damage, water damage and normal wear are not covered.
        </p>
      </section>

      {/* Payment & collection */}
      <section aria-labelledby="pay-h" className="mt-8">
        <h2 id="pay-h" className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-white">
          <CreditCard className="size-4 text-brand" aria-hidden />
          Paying
        </h2>
        <ul className="mt-3 space-y-2">
          {paymentMethods.map((p) => (
            <li key={p.code} className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-navy-900 dark:text-white">{p.name}</span> — {p.note}
              {p.surcharge > 0 && ` · ${formatMoney(p.surcharge)} handling charge`}
              {p.maxOrderValue != null && ` · not available above ${formatMoney(p.maxOrderValue)}`}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 p-5 flex items-start gap-3">
        <Store className="size-4 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-slate-600 dark:text-slate-300">
          This storefront is part of a demonstration system. Nothing is dispatched, no
          payment is taken, and no message is sent to anyone.
        </p>
      </section>
    </div>
  );
}
