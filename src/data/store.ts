/**
 * Online store (B2C) seed data.
 *
 * Third sales channel on the same core. The storefront sells the SAME products
 * out of the SAME stock as the trade desk and the till — what changes is the
 * price list it reads, the fulfilment it triggers, and who is looking at it.
 *
 * Everything a consumer channel forces on the ERP lives here: retail pricing,
 * stock reservation, backorder promises, delivery methods and shipment states.
 */

import { products, type Product } from "./products";

/* ────────────────────────── Price lists ─────────────────────────── */

export type PriceListCode = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";

export type PriceList = {
  code: PriceListCode;
  name: string;
  channel: string;
  /** Markup applied to the base sale price, as a multiplier. */
  factor: number;
  taxInclusive: boolean;
  description: string;
};

/**
 * The base `salePrice` on a product is the trade price. Retail sits above it —
 * a distributor that sells online at its trade price undercuts its own dealers,
 * which is the fastest way to lose a dealer network.
 */
export const priceLists: PriceList[] = [
  {
    code: "RETAIL", name: "Retail (online store)", channel: "Online store",
    factor: 1.18, taxInclusive: true,
    description: "Consumer pricing shown on the storefront. Displayed tax-inclusive, as consumer law expects.",
  },
  {
    code: "WHOLESALE", name: "Wholesale", channel: "Trade desk · POS",
    factor: 1.0, taxInclusive: false,
    description: "Standard trade price for shops and retailers. Tax added at invoice.",
  },
  {
    code: "DISTRIBUTOR", name: "Distributor", channel: "Trade desk",
    factor: 0.92, taxInclusive: false,
    description: "Volume pricing for regional distributors on contract terms.",
  },
];

export const RETAIL = priceLists[0];

/** Retail price for a product, rounded to a price point a shopper expects. */
export function retailPrice(p: Product) {
  return Math.round((p.salePrice * RETAIL.factor) / 10) * 10;
}

/** Some lines carry a struck-through "was" price. Deterministic, not random. */
export function compareAtPrice(p: Product): number | null {
  if (p.id % 4 !== 0) return null;
  return Math.round((retailPrice(p) * 1.22) / 10) * 10;
}

/* ─────────────────── Stock promise (reservation) ────────────────── */

export type StockPromise =
  | { state: "IN_STOCK"; available: number; despatch: string }
  | { state: "LOW"; available: number; despatch: string }
  | { state: "BACKORDER"; available: 0; despatch: string; leadDays: number }
  | { state: "UNAVAILABLE"; available: 0; despatch: string };

/**
 * What the shopper is actually promised.
 *
 * `totalStock` is the physical count; a slice is always reserved for the trade
 * desk and the counter, so the storefront may only sell what is left. Selling
 * the same unit twice across channels is the classic multi-channel failure.
 */
export const CHANNEL_RESERVE = 5;

export function stockPromise(p: Product): StockPromise {
  const available = Math.max(0, p.totalStock - CHANNEL_RESERVE);
  if (!p.isActive) return { state: "UNAVAILABLE", available: 0, despatch: "Not sold online" };
  if (available <= 0) return { state: "BACKORDER", available: 0, despatch: "Ships in 7–10 days", leadDays: 9 };
  if (available <= 10) return { state: "LOW", available, despatch: "Ships today if ordered before 4pm" };
  return { state: "IN_STOCK", available, despatch: "Ships today if ordered before 4pm" };
}

/* ───────────────────────── Delivery methods ─────────────────────── */

export type DeliveryMethod = {
  code: string;
  name: string;
  eta: string;
  fee: number;
  /** Orders at or above this subtotal ship free on this method. */
  freeOver: number | null;
  note: string;
};

export const deliveryMethods: DeliveryMethod[] = [
  { code: "STANDARD", name: "Standard delivery", eta: "3–5 working days", fee: 250,  freeOver: 5000, note: "Nationwide courier, tracked" },
  { code: "EXPRESS",  name: "Express delivery",  eta: "1–2 working days", fee: 650,  freeOver: null, note: "Next-day in major cities" },
  { code: "PICKUP",   name: "Collect in store",  eta: "Ready in 2 hours", fee: 0,    freeOver: null, note: "Karachi · Lahore · Islamabad counters" },
];

export type PaymentMethod = {
  code: string;
  name: string;
  note: string;
  /** Cash on delivery carries a handling charge and a value ceiling. */
  surcharge: number;
  maxOrderValue: number | null;
};

export const paymentMethods: PaymentMethod[] = [
  { code: "CARD",      name: "Debit / credit card", note: "Secure checkout",              surcharge: 0,   maxOrderValue: null },
  { code: "EASYPAISA", name: "Easypaisa",           note: "Pay from your mobile wallet",  surcharge: 0,   maxOrderValue: null },
  { code: "JAZZCASH",  name: "JazzCash",            note: "Pay from your mobile wallet",  surcharge: 0,   maxOrderValue: null },
  { code: "COD",       name: "Cash on delivery",    note: "Pay the rider on arrival",     surcharge: 150, maxOrderValue: 25000 },
];

/* ───────────────────────── Promo codes ──────────────────────────── */

export type PromoCode = {
  code: string;
  label: string;
  percentOff: number;
  minSubtotal: number;
};

export const promoCodes: PromoCode[] = [
  { code: "WELCOME10", label: "10% off your first order", percentOff: 10, minSubtotal: 2000 },
  { code: "AUDIO15",   label: "15% off audio",            percentOff: 15, minSubtotal: 5000 },
];

/* ──────────────────── Storefront merchandising ──────────────────── */

/** Editorial copy per category so the storefront is not a bare SKU dump. */
export const storeCollections = [
  { categoryId: 2, title: "Earbuds",     blurb: "True wireless, ANC and everyday buds." },
  { categoryId: 7, title: "Power banks", blurb: "Carry a full day of charge." },
  { categoryId: 6, title: "Chargers",    blurb: "Fast charging, GaN and car adapters." },
  { categoryId: 4, title: "Speakers",    blurb: "Pocket speakers to 30W soundbars." },
  { categoryId: 9, title: "Cables",      blurb: "Type-C, Lightning and Micro-USB." },
];

/** Deterministic rating so the storefront reads like a real shop, not a table. */
export function productRating(p: Product) {
  const stars = 3.6 + ((p.id * 17) % 14) / 10;
  const count = 8 + ((p.id * 31) % 240);
  return { stars: Math.min(5, Math.round(stars * 10) / 10), count };
}

export function isNewArrival(p: Product) {
  return p.id % 7 === 0;
}

export function bestSellerIds() {
  return [1, 12, 7, 16, 3, 19];
}

/* ─────────────────── Customer orders & shipments ────────────────── */

export type ShipmentState =
  | "PLACED"
  | "PAYMENT_CONFIRMED"
  | "PICKING"
  | "PACKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export const SHIPMENT_FLOW: ShipmentState[] = [
  "PLACED", "PAYMENT_CONFIRMED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED",
];

export const SHIPMENT_LABEL: Record<ShipmentState, string> = {
  PLACED: "Order placed",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PICKING: "Being picked",
  PACKED: "Packed",
  DISPATCHED: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export type OnlineOrderLine = {
  productId: number;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  /** Set on dispatch for serialised goods — the warranty record. */
  serials?: string[];
  /** Lines the warehouse could not fill from stock at the time of picking. */
  backordered?: number;
};

export type OnlineOrder = {
  id: number;
  orderNo: string;
  placedAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryCode: string;
  paymentCode: string;
  state: ShipmentState;
  trackingNo: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  lines: OnlineOrderLine[];
};

const ol = (productId: number, qty: number, extra: Partial<OnlineOrderLine> = {}): OnlineOrderLine => {
  const p = products.find((x) => x.id === productId)!;
  return { productId, name: p.name, sku: p.sku, qty, unitPrice: retailPrice(p), ...extra };
};

export const onlineOrders: OnlineOrder[] = [
  {
    id: 1, orderNo: "NX-ON-26-1043", placedAt: "2026-05-02T09:21:00",
    customerName: "Hira Siddiqui", email: "hira.s@example.demo", phone: "0301 2233445",
    address: "Flat 4B, Seaview Apartments, Clifton Block 2", city: "Karachi",
    deliveryCode: "EXPRESS", paymentCode: "CARD", state: "PICKING", trackingNo: null,
    subtotal: 6_460, deliveryFee: 650, discount: 0, total: 7_110,
    lines: [ol(1, 2), ol(19, 3)],
  },
  {
    id: 2, orderNo: "NX-ON-26-1042", placedAt: "2026-05-01T18:44:00",
    customerName: "Usman Tariq", email: "usman.t@example.demo", phone: "0333 9988776",
    address: "House 22, Street 7, DHA Phase 5", city: "Lahore",
    deliveryCode: "STANDARD", paymentCode: "COD", state: "DISPATCHED", trackingNo: "TCS-884120397",
    subtotal: 5_240, deliveryFee: 0, discount: 524, total: 4_866,
    lines: [ol(12, 1), ol(16, 2, { serials: ["NX-SPK-2026-004417"] })],
  },
  {
    id: 3, orderNo: "NX-ON-26-1041", placedAt: "2026-04-30T12:05:00",
    customerName: "Ayesha Nawaz", email: "ayesha.n@example.demo", phone: "0345 1122334",
    address: "Office 12, Blue Area Plaza", city: "Islamabad",
    deliveryCode: "PICKUP", paymentCode: "EASYPAISA", state: "DELIVERED", trackingNo: null,
    subtotal: 2_930, deliveryFee: 0, discount: 0, total: 2_930,
    lines: [ol(7, 1)],
  },
  {
    id: 4, orderNo: "NX-ON-26-1040", placedAt: "2026-04-29T15:12:00",
    customerName: "Bilal Qureshi", email: "bilal.q@example.demo", phone: "0312 4455667",
    address: "Shop 8, Hafeez Centre", city: "Lahore",
    deliveryCode: "STANDARD", paymentCode: "CARD", state: "PACKED", trackingNo: null,
    subtotal: 9_180, deliveryFee: 0, discount: 0, total: 9_180,
    lines: [ol(3, 2), ol(9, 1, { backordered: 1 })],
  },
];

/** The signed-in shopper on the storefront side of the demo. */
export const storeCustomer = {
  name: "Hira Siddiqui",
  email: "hira.s@example.demo",
  phone: "0301 2233445",
  address: "Flat 4B, Seaview Apartments, Clifton Block 2",
  city: "Karachi",
};

/* ─────────────────── Serialised goods & backorders ──────────────── */

/**
 * Which lines need a serial number captured at despatch.
 *
 * The storefront promises a 12-month warranty "without a receipt", and that
 * promise is only keepable if the unit that left the warehouse was recorded.
 * Cables and cases are not worth serialising; anything above this threshold is.
 */
export const SERIALISE_ABOVE = 1500;

export function isSerialised(p: Product) {
  return p.salePrice >= SERIALISE_ABOVE;
}

/** A shortfall at picking becomes a promise, not a silent cancellation. */
export type Backorder = {
  id: number;
  orderNo: string;
  customerName: string;
  productId: number;
  sku: string;
  name: string;
  qty: number;
  raisedAt: string;
  /** Inbound purchase order this shortfall is waiting on, if one exists. */
  expectedFromPo: string | null;
  expectedDate: string | null;
};

export const backorders: Backorder[] = [
  {
    id: 1, orderNo: "NX-ON-26-1040", customerName: "Bilal Qureshi",
    productId: 9, sku: "NX-PWX-MAGSAFE", name: "Nortex PowerX MagSafe 5000mAh Wireless",
    qty: 1, raisedAt: "2026-04-29",
    expectedFromPo: "PO-KHI-26-0042", expectedDate: "2026-05-15",
  },
  {
    id: 2, orderNo: "NX-ON-26-1038", customerName: "Sana Farooq",
    productId: 14, sku: "NX-VSP-PRO-X1", name: "Nortex VSP Pro X1 Soundbar 30W",
    qty: 2, raisedAt: "2026-04-27",
    expectedFromPo: "PO-KHI-26-0041", expectedDate: "2026-05-12",
  },
  {
    id: 3, orderNo: "NX-ON-26-1037", customerName: "Kamran Javed",
    productId: 20, sku: "NX-VR-OTG-TC", name: "Nortex VR OTG Adapter Type-C",
    qty: 3, raisedAt: "2026-04-26",
    expectedFromPo: null, expectedDate: null,
  },
];

/* ────────────────────── Customer return requests ────────────────── */

export const storeReturnReasons = [
  "Faulty or not working",
  "Not as described",
  "Wrong item delivered",
  "Changed my mind",
  "Damaged in transit",
] as const;

export type StoreReturnReason = (typeof storeReturnReasons)[number];

/** A return can only be asked for while the window is open. */
export const RETURN_WINDOW_DAYS = 14;
