"use client";

import * as React from "react";
import { FileText, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportToolbar } from "@/components/widgets/report-toolbar";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectNative } from "@/components/ui/select-native";
import { DataTable, type Column } from "@/components/ui/data-table";
import { parties } from "@/data/parties";
import { invoices } from "@/data/sales";
import { formatMoney, formatDate } from "@/lib/format";

const CUSTOMERS = parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");

type LedgerRow = {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

/**
 * Invoices raise the balance, payments settle it — classic running statement.
 *
 * The statement opens with a brought-forward figure derived from the party's
 * recorded balance, so the closing balance here always agrees with the balance
 * shown on the customer record and in AR aging. Without it the statement would
 * quietly contradict the rest of the system.
 */
function buildLedger(customerId: number): LedgerRow[] {
  const party = CUSTOMERS.find((c) => c.id === customerId);
  const rows: Omit<LedgerRow, "balance">[] = [];

  const periodInvoices = invoices.filter((i) => i.customerId === customerId);
  const periodMovement = periodInvoices.reduce((s, i) => s + i.total - i.paid, 0);
  const opening = (party?.currentBalance ?? 0) - periodMovement;

  rows.push({
    id: "opening",
    date: "0000-00-00",
    reference: "—",
    description: "Balance brought forward",
    debit: opening > 0 ? opening : 0,
    credit: opening < 0 ? -opening : 0,
  });

  for (const inv of periodInvoices) {
    rows.push({
      id: `${inv.invoiceNo}-D`,
      date: inv.invoiceDate,
      reference: inv.invoiceNo,
      description: `Sales invoice against ${inv.orderNo}`,
      debit: inv.total,
      credit: 0,
    });
    if (inv.paid > 0) {
      rows.push({
        id: `${inv.invoiceNo}-C`,
        date: inv.dueDate,
        reference: `RCPT-${inv.invoiceNo.slice(-4)}`,
        description: `Payment received — ${inv.paymentMethod.toLowerCase()}`,
        debit: 0,
        credit: inv.paid,
      });
    }
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  return rows.map((r) => {
    running += r.debit - r.credit;
    return { ...r, balance: running };
  });
}

/** Open on the customer with the most activity — an empty statement is a poor first impression. */
const DEFAULT_CUSTOMER_ID = [...CUSTOMERS]
  .sort((a, b) =>
    invoices.filter((i) => i.customerId === b.id).length -
    invoices.filter((i) => i.customerId === a.id).length
  )[0]?.id ?? 0;

export default function CustomerStatementPage() {
  const [customerId, setCustomerId] = React.useState<number>(DEFAULT_CUSTOMER_ID);
  const [from, setFrom] = React.useState(() => new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const customer = CUSTOMERS.find((c) => c.id === customerId);
  const ledger = React.useMemo(() => buildLedger(customerId), [customerId]);

  const movements = ledger.filter((r) => r.id !== "opening");
  const debits = movements.reduce((s, r) => s + r.debit, 0);
  const credits = movements.reduce((s, r) => s + r.credit, 0);
  const closing = ledger.length ? ledger[ledger.length - 1].balance : 0;

  const columns: Column<LedgerRow>[] = [
    { key: "date",        header: "Date",        cell: (r) => (
        <span className="tabular text-xs text-slate-500 dark:text-slate-400">
          {r.id === "opening" ? "Opening" : formatDate(r.date)}
        </span>
      ) },
    { key: "reference",   header: "Reference",   cell: (r) => <span className="tabular text-sm font-medium text-navy-900 dark:text-white">{r.reference}</span> },
    { key: "description", header: "Description", cell: (r) => <span className="text-sm text-slate-600 dark:text-slate-300">{r.description}</span> },
    { key: "debit",       header: "Debit",       align: "right", cell: (r) => r.debit ? <span className="tabular text-sm text-navy-900 dark:text-white">{formatMoney(r.debit)}</span> : <span className="text-slate-300 dark:text-navy-600">—</span> },
    { key: "credit",      header: "Credit",      align: "right", cell: (r) => r.credit ? <span className="tabular text-sm text-success font-medium">{formatMoney(r.credit)}</span> : <span className="text-slate-300 dark:text-navy-600">—</span> },
    { key: "balance",     header: "Balance",     align: "right", cell: (r) => <span className="tabular text-sm font-semibold text-navy-900 dark:text-white">{formatMoney(r.balance)}</span> },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Customer Statement" }]}
        title="Customer Statement"
        subtitle="Per-customer ledger with running balance"
        actions={
          <ReportToolbar
            mode="range"
            reportName="Customer Statement"
            fromDate={from}
            toDate={to}
            onRangeChange={(f, t) => { setFrom(f); setTo(t); }}
            branchId={branchId}
            onBranchChange={setBranchId}
          />
        }
      />

      <Card className="mb-6">
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
            <div>
              <label htmlFor="customer" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Customer
              </label>
              <SelectNative id="customer" value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}>
                {CUSTOMERS.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </SelectNative>
            </div>

            {customer && (
              <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
                <div>
                  <div className="text-base font-semibold text-navy-900 dark:text-white">{customer.legalName}</div>
                  <div className="text-2xs tabular text-slate-500 dark:text-slate-400">{customer.partyCode} · {customer.category}</div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5"><Phone className="size-3 text-slate-400" />{customer.phone}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="size-3 text-slate-400" />{customer.city}, {customer.province}</div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Credit limit <span className="tabular font-medium text-navy-900 dark:text-white">{formatMoney(customer.creditLimit)}</span></div>
                  <div>Terms <span className="font-medium text-navy-900 dark:text-white">{customer.creditDays} days</span></div>
                </div>
                <Badge variant={customer.rating === "A" ? "success" : customer.rating === "D" ? "danger" : "muted"}>
                  Rating {customer.rating}
                </Badge>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Invoiced</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatMoney(debits)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Received</div>
          <div className="text-2xl tabular font-bold text-success mt-1">{formatMoney(credits)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Closing Balance</div>
          <div className={`text-2xl tabular font-bold mt-1 ${closing > 0 ? "text-warning" : "text-navy-900 dark:text-white"}`}>{formatMoney(closing)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Entries</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{ledger.length}</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={ledger}
          pageSize={20}
          emptyState={
            <div className="py-12 text-center">
              <FileText className="size-8 text-slate-300 dark:text-navy-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No invoices or payments for this customer in the seeded data.</p>
            </div>
          }
        />
      </Card>
    </>
  );
}
