/**
 * Mock products — Nortex mobile accessories catalog.
 * Real Nortex product lines: Titan · PowerX · VSP · VR · VOLT
 */

export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  brandId: number;
  uomId: number;
  costPrice: number;
  salePrice: number;
  taxRatePercent: number;
  reorderLevel: number;
  hideStock: boolean;
  isActive: boolean;
  totalStock: number;     // computed across all warehouses
  status: "active" | "low" | "out" | "inactive";
  imageUrl: string | null;
  barcodes: string[];
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
  parentId: number | null;
  productCount: number;
  isActive: boolean;
};

export type Brand = {
  id: number;
  name: string;
  description: string;
  productCount: number;
  isActive: boolean;
};

export type UoM = {
  id: number;
  code: string;
  name: string;
  decimals: number;
};

export const categories: Category[] = [
  { id: 1, name: "Audio",          parentId: null, productCount: 18, isActive: true },
  { id: 2, name: "Earbuds",        parentId: 1,    productCount: 8,  isActive: true },
  { id: 3, name: "Handfree",       parentId: 1,    productCount: 6,  isActive: true },
  { id: 4, name: "Speakers",       parentId: 1,    productCount: 4,  isActive: true },
  { id: 5, name: "Power",          parentId: null, productCount: 14, isActive: true },
  { id: 6, name: "Chargers",       parentId: 5,    productCount: 7,  isActive: true },
  { id: 7, name: "Power Banks",    parentId: 5,    productCount: 5,  isActive: true },
  { id: 8, name: "Batteries",      parentId: 5,    productCount: 2,  isActive: true },
  { id: 9, name: "Cables",         parentId: null, productCount: 11, isActive: true },
  { id: 10, name: "Type-C",        parentId: 9,    productCount: 5,  isActive: true },
  { id: 11, name: "Lightning",     parentId: 9,    productCount: 3,  isActive: true },
  { id: 12, name: "Micro-USB",     parentId: 9,    productCount: 3,  isActive: true },
  { id: 13, name: "Bluetooth",     parentId: null, productCount: 6,  isActive: true },
  { id: 14, name: "LED Bulbs",     parentId: null, productCount: 4,  isActive: true },
];

export const brands: Brand[] = [
  { id: 1, name: "Nortex Titan",  description: "Premium audio line — earbuds, ANC headphones",      productCount: 8,  isActive: true },
  { id: 2, name: "Nortex PowerX", description: "Power banks, fast chargers, batteries",             productCount: 12, isActive: true },
  { id: 3, name: "Nortex VSP",    description: "Nortex Speaker Pro — Bluetooth speakers, soundbars",  productCount: 5,  isActive: true },
  { id: 4, name: "Nortex VR",     description: "Data cables, adapters, hubs",                       productCount: 9,  isActive: true },
  { id: 5, name: "Nortex VOLT",   description: "Wall chargers, car chargers, GAN tech",             productCount: 7,  isActive: true },
];

export const units: UoM[] = [
  { id: 1, code: "PCS", name: "Pieces",  decimals: 0 },
  { id: 2, code: "BOX", name: "Box",     decimals: 0 },
  { id: 3, code: "CTN", name: "Carton",  decimals: 0 },
  { id: 4, code: "PKT", name: "Packet",  decimals: 0 },
];

const make = (
  id: number,
  sku: string,
  name: string,
  categoryId: number,
  brandId: number,
  costPrice: number,
  salePrice: number,
  totalStock: number,
  reorderLevel: number,
  description = ""
): Product => {
  const status: Product["status"] =
    totalStock === 0 ? "out" : totalStock < reorderLevel ? "low" : "active";
  return {
    id,
    sku,
    name,
    description,
    categoryId,
    brandId,
    uomId: 1,
    costPrice,
    salePrice,
    taxRatePercent: 18,
    reorderLevel,
    hideStock: false,
    isActive: true,
    totalStock,
    status,
    imageUrl: null,
    barcodes: [`${600000000000 + id}`],
    createdAt: "2025-09-15",
  };
};

export const products: Product[] = [
  /* Nortex Titan — Earbuds */
  make(1,  "NX-TIT-T9-BLK",     "Nortex Titan T9 Wireless Earbuds — Black",     2, 1, 580,  980,   1240, 200, "TWS earbuds with ENC, 30-hour playtime"),
  make(2,  "NX-TIT-T9-WHT",     "Nortex Titan T9 Wireless Earbuds — White",     2, 1, 580,  980,   980,  200, "TWS earbuds with ENC, 30-hour playtime"),
  make(3,  "NX-TIT-T15-PRO",    "Nortex Titan T15 Pro ANC Earbuds",             2, 1, 1480, 2480,  340,  100, "Active Noise Cancellation, hi-res audio"),
  make(4,  "NX-TIT-AIR-PRO",    "Nortex Titan AirPro Earbuds",                  2, 1, 720,  1280,  540,  150, "Half-in-ear design, premium sound"),
  /* Nortex Titan — Handfree */
  make(5,  "NX-TIT-HF-S7",      "Nortex Titan S7 Handfree (Wired) — 3.5mm",     3, 1, 95,   195,   2480, 400, "In-ear wired handfree with mic"),
  make(6,  "NX-TIT-HF-V8",      "Nortex Titan V8 Handfree — Type-C",            3, 1, 145,  285,   1860, 300, "Type-C wired handfree, premium build"),

  /* Nortex PowerX — Power Banks */
  make(7,  "NX-PWX-10K-BLK",    "Nortex PowerX 10000mAh Power Bank — Black",    7, 2, 1280, 2180,  680,  100, "10000mAh, dual-output, fast charging"),
  make(8,  "NX-PWX-20K-BLK",    "Nortex PowerX 20000mAh Power Bank — Black",    7, 2, 2280, 3680,  340,  80,  "20000mAh, PD 22.5W, three outputs"),
  make(9,  "NX-PWX-MAGSAFE",    "Nortex PowerX MagSafe 5000mAh Wireless",       7, 2, 1980, 3280,  120,  50,  "Magnetic wireless charging, 5000mAh"),
  /* Nortex PowerX — Chargers */
  make(10, "NX-PWX-DUAL-USB",   "Nortex PowerX Dual USB Charger 2.4A",          6, 2, 180,  340,   3240, 500, "Dual USB ports, 2.4A output"),
  /* Nortex PowerX — Batteries */
  make(11, "NX-PWX-BAT-IPHONE", "Nortex PowerX iPhone 11 Replacement Battery",  8, 2, 580,  1180,  85,   30,  "OEM-grade replacement battery"),

  /* Nortex VSP — Speakers */
  make(12, "NX-VSP-MINI-RED",   "Nortex VSP Bluetooth Speaker Mini — Red",      4, 3, 380,  680,   840,  150, "Portable Bluetooth speaker, 5W"),
  make(13, "NX-VSP-MINI-BLU",   "Nortex VSP Bluetooth Speaker Mini — Blue",     4, 3, 380,  680,   720,  150, "Portable Bluetooth speaker, 5W"),
  make(14, "NX-VSP-PRO-X1",     "Nortex VSP Pro X1 Soundbar 30W",               4, 3, 2480, 4280,  148,  40,  "30W soundbar with subwoofer"),
  make(15, "NX-VSP-CUBE-Y",     "Nortex VSP Cube Y Yellow Mini Speaker",        4, 3, 480,  880,   24,   80,  "Compact cube design, 8W output"),

  /* Nortex VR — Cables */
  make(16, "NX-VR-TC-1.5M",     "Nortex VR Type-C Data Cable 1.5m",             10, 4, 95,  195,   1840, 400, "Premium braided Type-C cable, 5A"),
  make(17, "NX-VR-TC-3M",       "Nortex VR Type-C Data Cable 3.0m",             10, 4, 145, 295,   980,  300, "Long Type-C cable, premium braided"),
  make(18, "NX-VR-LIGHT-1.5M",  "Nortex VR Lightning Cable 1.5m (MFi)",         11, 4, 285, 580,   620,  200, "MFi-certified Lightning cable"),
  make(19, "NX-VR-MICRO-1M",    "Nortex VR Micro-USB Cable 1m",                 12, 4, 65,  140,   2480, 500, "Standard Micro-USB cable"),
  make(20, "NX-VR-OTG-TC",      "Nortex VR OTG Adapter Type-C",                 10, 4, 145, 295,   0,    100, "OTG adapter, Type-C to USB-A"),

  /* Nortex VOLT — Chargers */
  make(21, "NX-VLT-65W-PD",     "Nortex VOLT 65W GaN Type-C Charger (PD)",      6, 5, 1480, 2480,  410,  100, "Universal GaN charger, 65W PD"),
  make(22, "NX-VLT-30W-DUAL",   "Nortex VOLT 30W Dual Port Charger",            6, 5, 580,  980,   780,  200, "USB-A + Type-C, fast charging"),
  make(23, "NX-VLT-CAR-45W",    "Nortex VOLT Car Charger 45W",                  6, 5, 480,  840,   340,  100, "Dual-port car charger, PD 45W"),
  make(24, "NX-VLT-WIRELESS-15",  "Nortex VOLT Wireless Charger 15W",           6, 5, 680,  1180,  240,  80,  "Qi-certified wireless pad, 15W"),

  /* Bluetooth */
  make(25, "NX-BT-RECEIVER",    "Nortex Bluetooth Receiver 5.0",                13, 4, 280, 540,   180,  60,  "Aux Bluetooth receiver, 5.0"),
  make(26, "NX-BT-FM-TRANSMIT", "Nortex Bluetooth FM Transmitter for Car",      13, 4, 380, 720,   85,   40,  "Car FM transmitter, hands-free"),

  /* LED */
  make(27, "NX-LED-9W",         "Nortex LED Bulb 9W (Cool White)",              14, 2, 145, 285,   0,    100, "Energy-saving LED bulb 9W"),
  make(28, "NX-LED-12W",        "Nortex LED Bulb 12W (Cool White)",             14, 2, 195, 380,   12,   80,  "Energy-saving LED bulb 12W"),

  /* Out of stock / dead stock for demo */
  make(29, "NX-VR-LIGHT-2M",    "Nortex VR Lightning Cable 2m (MFi) — OLD",     11, 4, 285, 580,   8,    100, "Older SKU, slow moving"),
  make(30, "NX-TIT-HF-OLD",     "Nortex Titan Handfree Classic — Discontinued", 3,  1, 65,  140,   180,  0,   "Discontinued model"),
];

export function getProduct(id: number) {
  return products.find((p) => p.id === id);
}

export function getCategory(id: number) {
  return categories.find((c) => c.id === id);
}

export function getBrand(id: number) {
  return brands.find((b) => b.id === id);
}
