"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck, Store, CreditCard, Smartphone, Banknote, Lock, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import { products } from "@/data/products";
import {
  deliveryMethods, paymentMethods, stockPromise, storeCustomer,
} from "@/data/store";
import { useBasket } from "@/components/store/basket-provider";
import { computeBasket, paymentUnavailableReason } from "@/lib/store-cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const DELIVERY_ICON: Record<string, typeof Truck> = { STANDARD: Truck, EXPRESS: Truck, PICKUP: Store };
const PAYMENT_ICON: Record<string, typeof CreditCard> = {
  CARD: CreditCard, EASYPAISA: Smartphone, JAZZCASH: Smartphone, COD: Banknote,
};

export default function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { lines, clear, ready } = useBasket();

  const [delivery, setDelivery] = React.useState("STANDARD");
  const [payment, setPayment] = React.useState("CARD");
  const [placing, setPlacing] = React.useState(false);
  const [placed, setPlaced] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [form, setForm] = React.useState({
    name: storeCustomer.name,
    email: storeCustomer.email,
    phone: storeCustomer.phone,
    address: storeCustomer.address,
    city: storeCustomer.city,
  });

  const promo = params.get("promo") ?? "";
  const totals = computeBasket(lines, { deliveryCode: delivery, paymentCode: payment, promo });

  const backorderLines = lines.filter((l) => {
    const p = products.find((x) => x.id === l.productId);
    return p ? stockPromise(p).state === "BACKORDER" : false;
  });

  const codBlocked = paymentUnavailableReason(payment, totals.total);
  const needsAddress = delivery !== "PICKUP";
  const missing = {
    name: !form.name.trim(),
    email: !/^\S+@\S+\.\S+$/.test(form.email),
    phone: form.phone.trim().length < 7,
    address: needsAddress && !form.address.trim(),
    city: needsAddress && !form.city.trim(),
  };
  const hasErrors = Object.values(missing).some(Boolean) || !!codBlocked;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) {
      /* Send focus to the first thing that is wrong, rather than making the
         shopper hunt for the red text. */
      const firstBad = Object.entries(missing).find(([, bad]) => bad)?.[0];
      if (firstBad) document.getElementById(firstBad)?.focus();
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900));
    const orderNo = `NX-ON-26-${1044 + lines.length}`;
    /* `placed` has to be set before the basket is emptied: otherwise this
       component re-renders into its empty-basket state and swallows the
       navigation to the confirmation. */
    setPlaced(true);
    clear();
    router.push(`/store/orders/${orderNo}?placed=1`);
  }

  if (!ready) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-500">Loading checkout…</div>;
  }

  if (lines.length === 0 && !placed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-navy-900 dark:text-white">Nothing to check out</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Your basket is empty.</p>
        <Link href="/store/products" className="mt-6 inline-flex h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold items-center">
          Shop all products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Checkout</h1>

      <form onSubmit={placeOrder} noValidate className="grid lg:grid-cols-[1fr_340px] gap-8 mt-6 items-start">
        <div className="space-y-6">
          {/* 1 — Contact & address */}
          <section aria-labelledby="details-h" className="rounded-xl border border-slate-200 dark:border-navy-700 p-5">
            <h2 id="details-h" className="text-sm font-bold text-navy-900 dark:text-white">1 · Your details</h2>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field
                id="name" label="Full name" value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                invalid={touched && missing.name} error="Enter the name for the delivery."
                autoComplete="name"
              />
              <Field
                id="phone" label="Mobile number" value={form.phone} type="tel"
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                invalid={touched && missing.phone} error="We need a number for the courier."
                autoComplete="tel" hint="The rider calls this number before arriving."
              />
              <div className="sm:col-span-2">
                <Field
                  id="email" label="Email" value={form.email} type="email"
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  invalid={touched && missing.email} error="Enter a valid email so we can send the receipt."
                  autoComplete="email"
                />
              </div>
            </div>
          </section>

          {/* 2 — Delivery */}
          <section aria-labelledby="delivery-h" className="rounded-xl border border-slate-200 dark:border-navy-700 p-5">
            <h2 id="delivery-h" className="text-sm font-bold text-navy-900 dark:text-white">2 · Delivery</h2>

            <fieldset className="mt-4">
              <legend className="sr-only">Delivery method</legend>
              <div className="space-y-2">
                {deliveryMethods.map((d) => {
                  const Icon = DELIVERY_ICON[d.code] ?? Truck;
                  const active = delivery === d.code;
                  const free = d.freeOver != null && totals.subtotal - totals.discount >= d.freeOver;
                  return (
                    <label
                      key={d.code}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        active ? "border-brand bg-brand-50/60 dark:bg-brand/10" : "border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-500"
                      )}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={d.code}
                        checked={active}
                        onChange={() => setDelivery(d.code)}
                        className="mt-1 size-4 text-brand focus:ring-2 focus:ring-brand"
                      />
                      <Icon className={cn("size-4 mt-0.5 flex-shrink-0", active ? "text-brand" : "text-slate-400")} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-navy-900 dark:text-white">{d.name}</span>
                        <span className="block text-2xs text-slate-500 dark:text-slate-400">{d.eta} · {d.note}</span>
                      </span>
                      <span className="text-sm tabular font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                        {d.fee === 0 || free ? <span className="text-success">Free</span> : formatMoney(d.fee)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {needsAddress ? (
              <div className="grid sm:grid-cols-[1fr_180px] gap-4 mt-4">
                <Field
                  id="address" label="Delivery address" value={form.address}
                  onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                  invalid={touched && missing.address} error="Enter the street address."
                  autoComplete="street-address"
                />
                <Field
                  id="city" label="City" value={form.city}
                  onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                  invalid={touched && missing.city} error="Enter the city."
                  autoComplete="address-level2"
                />
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 rounded-lg bg-slate-50 dark:bg-navy-950 px-3 py-2.5">
                Collect from any of our three counters. We will message you when the order is ready.
              </p>
            )}

            {backorderLines.length > 0 && (
              <div className="mt-4 rounded-lg border border-info/30 bg-info/5 px-3 py-2.5 flex items-start gap-2.5">
                <Clock className="size-4 text-info flex-shrink-0 mt-0.5" aria-hidden />
                <p className="text-2xs text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-info">Split delivery.</span>{" "}
                  {backorderLines.length} {backorderLines.length === 1 ? "item is" : "items are"} on backorder
                  and will ship separately in 7–10 days. You are not charged twice for delivery.
                </p>
              </div>
            )}
          </section>

          {/* 3 — Payment */}
          <section aria-labelledby="payment-h" className="rounded-xl border border-slate-200 dark:border-navy-700 p-5">
            <h2 id="payment-h" className="text-sm font-bold text-navy-900 dark:text-white">3 · Payment</h2>

            <fieldset className="mt-4">
              <legend className="sr-only">Payment method</legend>
              <div className="grid sm:grid-cols-2 gap-2">
                {paymentMethods.map((p) => {
                  const Icon = PAYMENT_ICON[p.code] ?? CreditCard;
                  const active = payment === p.code;
                  return (
                    <label
                      key={p.code}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        active ? "border-brand bg-brand-50/60 dark:bg-brand/10" : "border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-500"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={p.code}
                        checked={active}
                        onChange={() => setPayment(p.code)}
                        className="mt-0.5 size-4 text-brand focus:ring-2 focus:ring-brand"
                      />
                      <Icon className={cn("size-4 mt-0.5 flex-shrink-0", active ? "text-brand" : "text-slate-400")} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-navy-900 dark:text-white">{p.name}</span>
                        <span className="block text-2xs text-slate-500 dark:text-slate-400">
                          {p.note}{p.surcharge > 0 ? ` · +${formatMoney(p.surcharge)} handling` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {codBlocked && (
              <p role="alert" className="mt-3 flex items-start gap-2 text-2xs text-danger">
                <AlertCircle className="size-3.5 flex-shrink-0 mt-px" aria-hidden />
                {codBlocked}
              </p>
            )}

            <p className="mt-4 flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400">
              <Lock className="size-3" aria-hidden />
              This is a demonstration checkout. No payment is taken and no order is dispatched.
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="rounded-xl border border-slate-200 dark:border-navy-700 p-4 lg:sticky lg:top-32">
          <h2 className="text-sm font-bold text-navy-900 dark:text-white">Your order</h2>

          <ul className="mt-3 space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-start gap-2 text-xs">
                <span className="tabular text-slate-500 dark:text-slate-400 w-7 flex-shrink-0">{l.qty}×</span>
                <span className="flex-1 min-w-0 text-navy-900 dark:text-white line-clamp-2">{l.name}</span>
                <span className="tabular font-medium text-navy-900 dark:text-white">{formatMoney(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700 space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
            {totals.discount > 0 && <Row label={`Discount (${promo})`} value={`− ${formatMoney(totals.discount)}`} tone="success" />}
            <Row
              label="Delivery"
              value={totals.deliveryFee === 0 ? "Free" : formatMoney(totals.deliveryFee)}
              tone={totals.deliveryFee === 0 ? "success" : undefined}
            />
            {totals.surcharge > 0 && <Row label="Cash handling" value={formatMoney(totals.surcharge)} />}
          </dl>

          <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-slate-200 dark:border-navy-700">
            <span className="text-sm font-semibold text-navy-900 dark:text-white">Total</span>
            <span className="text-2xl tabular font-bold text-navy-900 dark:text-white">{formatMoney(totals.total)}</span>
          </div>
          <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
            Includes {formatMoney(totals.taxIncluded)} sales tax
          </p>

          <button
            type="submit"
            disabled={placing}
            className="mt-4 w-full h-12 rounded-lg bg-brand text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-brand-700 disabled:opacity-60 transition-colors"
          >
            {placing ? "Placing order…" : <><CheckCircle2 className="size-4" aria-hidden /> Place order</>}
          </button>
          <Link href="/store/cart" className="mt-2 block text-center text-2xs text-slate-500 dark:text-slate-400 hover:text-brand">
            Back to basket
          </Link>
        </aside>
      </form>
    </div>
  );
}

function Field({
  id, label, value, onChange, invalid, error, hint, type = "text", autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  error?: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
        {label} <span className="text-danger">*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          "w-full h-11 px-3 rounded-lg border bg-transparent text-sm text-navy-900 dark:text-white focus:outline-none",
          invalid ? "border-danger focus:border-danger" : "border-slate-200 dark:border-navy-700 focus:border-brand"
        )}
      />
      {invalid && error ? (
        <p id={`${id}-error`} role="alert" className="text-2xs text-danger mt-1">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-2xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className={tone === "success" ? "tabular font-medium text-success" : "tabular font-medium text-navy-900 dark:text-white"}>
        {value}
      </dd>
    </div>
  );
}

