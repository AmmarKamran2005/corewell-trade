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
import { purchaseInvoices } from "@/data/purchases";
import { formatMoney, formatDate } from "@/lib/format";

const SUPPLIERS = parties.filter((p) => p.type === "SUPPLIER" || p.type === "BOTH");

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
 * Mirror image of the customer statement: a supplier invoice credits the
 * payable, a payment debits it. Withholding tax is shown as its own debit so
 * the balance reconciles with what is actually owed to the supplier.
 *
 * Opens with a brought-forward figure so the closing payable agrees with the
 * balance on the supplier record and in AP aging.
 */
function buildLedger(supplierName: string, payableBalance: number): LedgerRow[] {
  const rows: Omit<LedgerRow, "balance">[] = [];
  const periodInvoices = purchaseInvoices.filter((p) => p.supplierName === supplierName);
  const periodMovement = periodInvoices.reduce((s, p) => s + p.total - p.whtAmount - p.paid, 0);
  const opening = payableBalance - periodMovement;

  rows.push({
    id: "opening",
    date: "0000-00-00",
    reference: "—",
    description: "Balance brought forward",
    debit: opening < 0 ? -opening : 0,
    credit: opening > 0 ? opening : 0,
  });

  for (const pi of periodInvoices) {
    rows.push({
      id: `${pi.invoiceNo}-C`,
      date: pi.invoiceDate,
      reference: pi.invoiceNo,
      description: `Purchase invoice ${pi.supplierInvoiceNo} against ${pi.poNo}`,
      debit: 0,
      credit: pi.total,
    });
    if (pi.whtAmount > 0) {
      rows.push({
        id: `${pi.invoiceNo}-W`,
        date: pi.invoiceDate,
        reference: `WHT-${pi.invoiceNo.slice(-4)}`,
        description: "Withholding tax deducted at source",
        debit: pi.whtAmount,
        credit: 0,
      });
    }
    if (pi.paid > 0) {
      rows.push({
        id: `${pi.invoiceNo}-P`,
        date: pi.dueDate,
        reference: `PMT-${pi.invoiceNo.slice(-4)}`,
        description: `Payment made — ${pi.paymentMethod.toLowerCase()}`,
        debit: pi.paid,
        credit: 0,
      });
    }
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  return rows.map((r) => {
    running += r.credit - r.debit;
    return { ...r, balance: running };
  });
}

/** Open on the supplier with the most activity — an empty ledger is a poor first impression. */
const DEFAULT_SUPPLIER_ID = [...SUPPLIERS]
  .sort((a, b) =>
    purchaseInvoices.filter((p) => p.supplierName === b.legalName).length -
    purchaseInvoices.filter((p) => p.supplierName === a.legalName).length
  )[0]?.id ?? 0;

export default function SupplierLedgerPage() {
  const [supplierId, setSupplierId] = React.useState<number>(DEFAULT_SUPPLIER_ID);
  const [from, setFrom] = React.useState(() => new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const supplier = SUPPLIERS.find((s) => s.id === supplierId);
  const ledger = React.useMemo(
    () => (supplier ? buildLedger(supplier.legalName, supplier.payableBalance) : []),
    [supplier]
  );

  const movements = ledger.filter((r) => r.id !== "opening");
  const credits = movements.reduce((s, r) => s + r.credit, 0);
  const debits = movements.reduce((s, r) => s + r.debit, 0);
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
    { key: "credit",      header: "Credit",      align: "right", cell: (r) => r.credit ? <span className="tabular text-sm text-warning font-medium">{formatMoney(r.credit)}</span> : <span className="text-slate-300 dark:text-navy-600">—</span> },
    { key: "balance",     header: "Payable",     align: "right", cell: (r) => <span className="tabular text-sm font-semibold text-navy-900 dark:text-white">{formatMoney(r.balance)}</span> },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Supplier Ledger" }]}
        title="Supplier Ledger"
        subtitle="Per-supplier transaction history and payable balance"
        actions={
          <ReportToolbar
            mode="range"
            reportName="Supplier Ledger"
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
              <label htmlFor="supplier" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Supplier
              </label>
              <SelectNative id="supplier" value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))}>
                {SUPPLIERS.map((s) => (
                  <option key={s.id} value={s.id}>{s.displayName}</option>
                ))}
              </SelectNative>
            </div>

            {supplier && (
              <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
                <div>
                  <div className="text-base font-semibold text-navy-900 dark:text-white">{supplier.legalName}</div>
                  <div className="text-2xs tabular text-slate-500 dark:text-slate-400">{supplier.partyCode} · {supplier.category}</div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5"><Phone className="size-3 text-slate-400" />{supplier.phone}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="size-3 text-slate-400" />{supplier.city}, {supplier.province}</div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Terms <span className="font-medium text-navy-900 dark:text-white">{supplier.creditDays} days</span></div>
                  <div>Tax ID <span className="tabular font-medium text-navy-900 dark:text-white">{supplier.taxId ?? "—"}</span></div>
                </div>
                <Badge variant={supplier.isActive ? "success" : "muted"}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Billed</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatMoney(credits)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Paid &amp; Withheld</div>
          <div className="text-2xl tabular font-bold text-success mt-1">{formatMoney(debits)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Payable Balance</div>
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
              <p className="text-sm text-slate-500 dark:text-slate-400">No purchase invoices for this supplier in the seeded data.</p>
            </div>
          }
        />
      </Card>
    </>
  );
}
