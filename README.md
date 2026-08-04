# Corewell Trade

A multi-branch distribution ERP with a point-of-sale till and a consumer
storefront — three sales channels on one catalogue, one stock pool and one
ledger.

Built by **[Corewell Systems](https://corewellsystems.com)** as a public
demonstration of the systems we design for operating businesses.

> **This is a demonstration front end.** Every screen runs on seeded, fabricated
> data held in the browser. There is no database, no API and no authentication —
> nothing you type is stored, sent or charged. See [Status](#status).

---

## What it covers

**Trade desk** — sales orders with a live credit-limit check and a credit-hold
queue, invoices, returns, a unified customer/supplier party model, purchase
orders, goods receipts, purchase invoices and returns.

**Inventory** — products, categories, brands, units, stock levels and
movements, adjustments, inter-warehouse transfers, and price lists (retail,
wholesale and distributor prices over a single catalogue).

**Point of sale** (`/pos`) — a full-screen, keyboard-first till: barcode scan,
cart, split tender across cash/card/mobile wallets with change due, park and
recall, counter returns against a receipt, and register open/close with an X/Z
report and a drawer variance.

**Online store** (`/store`) — a consumer storefront on the same catalogue:
browse and filter, product pages, basket, checkout with delivery and payment
options, order tracking, and customer-initiated returns.

**Fulfilment** — online orders flow to a pick → pack → dispatch queue. Short
picks raise backorders rather than cancelling lines, and serialised goods
require a serial number before they can be dispatched.

**Accounting** — chart of accounts, double-entry journal entries, vouchers,
expenses, general ledger, trial balance, profit & loss, balance sheet, cash
flow, bank reconciliation, period close, and a Zakat calculation module.

**Reports** — a 19-report library covering sales, purchases, inventory
valuation, AR/AP aging, customer statements and supplier ledgers.

**Administration** — users, a grouped role/permission matrix, branches,
warehouses, audit log, backup/restore, and system settings.

---

## Status

| | |
|---|---|
| Front end | Complete — 120 routes, no placeholder screens |
| Backend | **Not built.** No API, no database, no auth |
| Data | Typed mock modules; writes are simulated and reset on reload |
| AI assistant | Returns a canned response and says so on screen |

Planned next: a NestJS + Prisma + PostgreSQL backend behind the same screens.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. Sign in with any of the demo accounts printed
on the login screen — the password is shown there too.

| Surface | Route |
|---|---|
| Trade desk | `/dashboard` |
| Point of sale | `/pos` |
| Online store | `/store` |

Checks that should pass before a change lands:

```bash
npx tsc --noEmit && npx eslint src --max-warnings 0 && npm run build
```

> Stop the dev server before running `npm run build`. A production build and a
> dev server sharing `.next` leaves a stale route manifest, and pages start
> returning 404 for no visible reason.

---

## Built with

Next.js 16 (App Router) · React 19 with the React Compiler · TypeScript strict ·
Tailwind CSS v4 · Radix UI primitives · React Hook Form + Zod · Recharts ·
next-themes

---

## About the sample data

The business shown in the app — *Nortex Traders*, a mobile-accessories
distributor working out of Karachi, Lahore and Islamabad — is fictional. Its
customers, suppliers, products, prices, orders and staff are all fabricated for
the demonstration. Any resemblance to a real business is coincidental.

---

## Licence

© 2026 Corewell Systems. All rights reserved.

The source is published so the engineering can be inspected. It is not licensed
for reuse or redistribution — [get in touch](mailto:contact@corewellsystems.com)
if you want something like it built.
