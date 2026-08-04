"use client";

import * as React from "react";
import type { Product } from "@/data/products";
import { addToBasket, setBasketQty, type BasketLine } from "@/lib/store-cart";

/**
 * The basket outlives the page — a shopper moves from a product to the
 * catalogue to checkout and expects it to follow them.
 *
 * localStorage *is* an external system, so the basket is modelled as one and
 * read through `useSyncExternalStore` rather than copied into component state
 * inside an effect. That also gets cross-tab sync for free: two open tabs stay
 * in agreement about what is in the basket.
 *
 * A deployed storefront would mirror this to a server cart so it survives a
 * change of device; the shape of the hook would not change.
 */

const KEY = "cwt-store-basket";

type Snapshot = { lines: BasketLine[]; ready: boolean };

const EMPTY: Snapshot = { lines: [], ready: false };

let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function read(): BasketLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BasketLine[]) : [];
  } catch {
    /* A corrupt basket must never stop the storefront from rendering. */
    return [];
  }
}

function commit(lines: BasketLine[]) {
  snapshot = { lines, ready: true };
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* Private-browsing quota errors shouldn't lose the in-memory basket. */
  }
  emit();
}

function subscribe(onChange: () => void) {
  if (!snapshot.ready) {
    snapshot = { lines: read(), ready: true };
  }
  listeners.add(onChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = { lines: read(), ready: true };
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

export function useBasket() {
  const { lines, ready } = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return React.useMemo(
    () => ({
      lines,
      ready,
      add: (p: Product, qty = 1) => commit(addToBasket(snapshot.lines, p, qty)),
      setQty: (productId: number, qty: number) => commit(setBasketQty(snapshot.lines, productId, qty)),
      remove: (productId: number) => commit(snapshot.lines.filter((l) => l.productId !== productId)),
      clear: () => commit([]),
    }),
    [lines, ready]
  );
}

/**
 * Kept as a component so the storefront layout reads clearly and so a server
 * cart can be introduced later without touching every consumer.
 */
export function BasketProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
