/**
 * Mock sales data — orders, invoices, returns
 */

export type OrderStatus =
  | "DRAFT" | "SUBMITTED" | "CREDIT_HOLD" | "CONFIRMED"
  | "PROCESSING" | "PACKED" | "DISPATCHED" | "INVOICED"
  | "DELIVERED" | "CANCELLED" | "RETURNED";

export type Order = {
  id: number;
  orderNo: string;
  customerId: number;
  customerName: string;
  customerInitials: string;
  customerType: string;
  branch: string;
  branchCode: string;
  warehouse: string;
  salesPerson: string;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "CASH" | "BANK" | "EASYPAISA" | "JAZZCASH" | "CREDIT";
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  creditHoldReason?: string;
};

const STATUS_VARIANT: Record<OrderStatus, "success" | "warning" | "danger" | "info" | "muted"> = {
  DRAFT:       "muted",
  SUBMITTED:   "info",
  CREDIT_HOLD: "warning",
  CONFIRMED:   "info",
  PROCESSING:  "muted",
  PACKED:      "muted",
  DISPATCHED:  "success",
  INVOICED:    "success",
  DELIVERED:   "success",
  CANCELLED:   "danger",
  RETURNED:    "danger",
};

export function getStatusVariant(s: OrderStatus) {
  return STATUS_VARIANT[s];
}

const o = (
  id: number,
  orderNo: string,
  customerId: number,
  customerName: string,
  customerInitials: string,
  customerType: string,
  branch: string,
  branchCode: string,
  salesPerson: string,
  date: string,
  status: OrderStatus,
  total: number,
  paymentMethod: Order["paymentMethod"] = "CREDIT",
  paymentStatus: Order["paymentStatus"] = "UNPAID",
  creditHoldReason?: string
): Order => ({
  id,
  orderNo,
  customerId,
  customerName,
  customerInitials,
  customerType,
  branch,
  branchCode,
  warehouse: branchCode === "CEN" ? "CEN-WH-01" : branchCode === "NGT" ? "NGT-WH-01" : "HBR-WH-01",
  salesPerson,
  orderDate: date,
  deliveryDate: date,
  status,
  itemCount: Math.floor(Math.random() * 8) + 2,
  subtotal: Math.round(total / 1.18),
  discount: 0,
  tax: Math.round(total - total / 1.18),
  total,
  paymentMethod,
  paymentStatus,
  creditHoldReason,
});

export const orders: Order[] = [
  o(1,  "ORD-CEN-26-0142", 1,  "Riverside Plaza Shop #28",   "HC", "Wholesaler",  "Central",   "CEN", "Sara Doyle",   "2026-04-30", "DISPATCHED",  145000, "CREDIT",    "UNPAID"),
  o(2,  "ORD-NGT-26-0089", 2,  "Mobile Zone Northgate",       "MZ", "Retailer",    "Northgate",    "NGT", "Sara Doyle",   "2026-04-30", "CREDIT_HOLD", 84500,  "CREDIT",    "UNPAID", "Customer exceeded credit limit by USD 12,400"),
  o(3,  "ORD-CEN-26-0141", 3,  "Market Row Mobile Plaza",      "SM", "Retailer",    "Central",   "CEN", "Hugo Ramos", "2026-04-30", "CONFIRMED",   32750,  "CREDIT",    "UNPAID"),
  o(4,  "ORD-HBR-26-0034", 4,  "Harbour Distributors",   "BA", "Distributor", "Harbour", "HBR", "Ben Alder", "2026-04-30", "DISPATCHED",  218000, "BANK",      "PAID"),
  o(5,  "ORD-CEN-26-0140", 5,  "Cellular World Central",       "CW", "Wholesaler",  "Central",   "CEN", "Hugo Ramos", "2026-04-30", "PACKED",      56200,  "CREDIT",    "UNPAID"),
  o(6,  "ORD-NGT-26-0088", 6,  "Fairview Mobile Mart",       "FM", "Retailer",    "Northgate",    "NGT", "Sara Doyle",   "2026-04-29", "DELIVERED",   18400,  "CASH",      "PAID"),
  o(7,  "ORD-CEN-26-0139", 8,  "Linkline Connect Northgate",  "ML", "Wholesaler",  "Northgate",    "NGT", "Sara Doyle",   "2026-04-29", "DISPATCHED",  98500,  "BANK",      "PARTIAL"),
  o(8,  "ORD-NGT-26-0087", 9,  "Mobile Mart Eastvale",       "MM", "Retailer",    "Northgate",    "NGT", "Ben Alder", "2026-04-29", "DELIVERED",   24600,  "EASYPAISA", "PAID"),
  o(9,  "ORD-CEN-26-0138", 10, "Star Communications",      "SC", "Distributor", "Central",   "CEN", "Sara Doyle",   "2026-04-29", "DELIVERED",   485000, "BANK",      "PAID"),
  o(10, "ORD-HBR-26-0033", 12, "Meridian Distributors",    "MD", "Distributor", "Harbour", "HBR", "Ben Alder", "2026-04-28", "DELIVERED",   320000, "BANK",      "PAID"),
  o(11, "ORD-CEN-26-0137", 7,  "Brookside Cellular",          "QC", "Retailer",    "Central",   "CEN", "Hugo Ramos", "2026-04-28", "DELIVERED",   12400,  "JAZZCASH",  "PAID"),
  o(12, "ORD-NGT-26-0086", 14, "Universal Mobile Westport", "UM", "Wholesaler",  "Northgate",    "NGT", "Sara Doyle",   "2026-04-28", "DRAFT",       45200,  "CREDIT",    "UNPAID"),
  o(13, "ORD-NGT-26-0085", 9,  "Mobile Mart Eastvale",       "MM", "Retailer",    "Northgate",    "NGT", "Ben Alder", "2026-04-27", "CREDIT_HOLD", 38400,  "CREDIT",    "UNPAID", "Outstanding 30+ days overdue"),
  o(14, "ORD-CEN-26-0136", 1,  "Riverside Plaza Shop #28",   "HC", "Wholesaler",  "Central",   "CEN", "Sara Doyle",   "2026-04-27", "CANCELLED",   88000,  "CREDIT",    "UNPAID"),
  o(15, "ORD-CEN-26-0135", 5,  "Cellular World Central",       "CW", "Wholesaler",  "Central",   "CEN", "Hugo Ramos", "2026-04-26", "DELIVERED",   142000, "BANK",      "PAID"),
];

export function getOrder(id: number) {
  return orders.find((o) => o.id === id);
}

/* INVOICES */
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID";

export type Invoice = {
  id: number;
  invoiceNo: string;
  orderNo: string;
  orderId: number;
  customerId: number;
  customerName: string;
  customerInitials: string;
  branch: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  paymentMethod: Order["paymentMethod"];
};

export const invoices: Invoice[] = orders
  .filter((o) => ["DISPATCHED", "INVOICED", "DELIVERED"].includes(o.status))
  .map((o, i) => {
    const paid = o.paymentStatus === "PAID" ? o.total : o.paymentStatus === "PARTIAL" ? Math.floor(o.total / 2) : 0;
    const status: InvoiceStatus =
      paid === o.total ? "PAID" : paid > 0 ? "PARTIAL" : new Date(o.orderDate) < new Date("2026-04-01") ? "OVERDUE" : "ISSUED";
    return {
      id: i + 1,
      invoiceNo: o.orderNo.replace("ORD", "INV"),
      orderNo: o.orderNo,
      orderId: o.id,
      customerId: o.customerId,
      customerName: o.customerName,
      customerInitials: o.customerInitials,
      branch: o.branch,
      invoiceDate: o.orderDate,
      dueDate: new Date(new Date(o.orderDate).getTime() + 30 * 86400000).toISOString().slice(0, 10),
      total: o.total,
      paid,
      balance: o.total - paid,
      status,
      paymentMethod: o.paymentMethod,
    };
  });

export const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, "success" | "warning" | "danger" | "info" | "muted"> = {
  DRAFT:   "muted",
  ISSUED:  "info",
  PARTIAL: "warning",
  PAID:    "success",
  OVERDUE: "danger",
  VOID:    "muted",
};

export function getInvoice(id: number) {
  return invoices.find((i) => i.id === id);
}

/* SALES RETURNS */
export type ReturnStatus = "DRAFT" | "APPROVED" | "POSTED" | "REJECTED";
export type Return = {
  id: number;
  returnNo: string;
  invoiceNo: string;
  customerName: string;
  customerInitials: string;
  branch: string;
  returnDate: string;
  reason: string;
  itemCount: number;
  totalAmount: number;
  resalableQty: number;
  damagedQty: number;
  refundMethod: "CASH" | "BANK" | "EASYPAISA" | "JAZZCASH" | "CREDIT_NOTE";
  status: ReturnStatus;
};

export const salesReturns: Return[] = [
  { id: 1, returnNo: "RET-CEN-26-0008", invoiceNo: "INV-CEN-26-0128", customerName: "Riverside Plaza Shop #28", customerInitials: "HC", branch: "Central",  returnDate: "2026-04-27", reason: "Defective items",       itemCount: 2, totalAmount: 8400,  resalableQty: 0, damagedQty: 4, refundMethod: "CREDIT_NOTE", status: "POSTED" },
  { id: 2, returnNo: "RET-NGT-26-0004", invoiceNo: "INV-NGT-26-0085", customerName: "Mobile Mart Eastvale",     customerInitials: "MM", branch: "Northgate",   returnDate: "2026-04-26", reason: "Wrong item shipped",     itemCount: 1, totalAmount: 1980,  resalableQty: 3, damagedQty: 0, refundMethod: "BANK",       status: "POSTED" },
  { id: 3, returnNo: "RET-CEN-26-0007", invoiceNo: "INV-CEN-26-0114", customerName: "Market Row Mobile Plaza",    customerInitials: "SM", branch: "Central",  returnDate: "2026-04-25", reason: "Customer dissatisfaction", itemCount: 1, totalAmount: 980, resalableQty: 1, damagedQty: 0, refundMethod: "CASH",       status: "APPROVED" },
  { id: 4, returnNo: "RET-HBR-26-0003", invoiceNo: "INV-HBR-26-0028", customerName: "Meridian Distributors",  customerInitials: "MD", branch: "Harbour",returnDate: "2026-04-24", reason: "Expired stock",           itemCount: 3, totalAmount: 14200, resalableQty: 0, damagedQty: 12, refundMethod: "BANK",      status: "POSTED" },
  { id: 5, returnNo: "RET-CEN-26-0006", invoiceNo: "INV-CEN-26-0098", customerName: "Cellular World Central",     customerInitials: "CW", branch: "Central",  returnDate: "2026-04-23", reason: "Over-supplied",           itemCount: 1, totalAmount: 4200,  resalableQty: 6, damagedQty: 0, refundMethod: "CREDIT_NOTE",status: "DRAFT" },
];

export const RETURN_STATUS_VARIANT: Record<ReturnStatus, "success" | "warning" | "danger" | "info" | "muted"> = {
  DRAFT:    "muted",
  APPROVED: "info",
  POSTED:   "success",
  REJECTED: "danger",
};
