/**
 * Mock accounting data: COA, journal entries, vouchers, expenses
 */

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type Account = {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  type: AccountType;
  subtype: string;
  isGroup: boolean;
  balance: number;
  currency: string;
};

export const accounts: Account[] = [
  /* ASSETS */
  { id: 1,   code: "1000", name: "Assets",                  parentId: null, type: "ASSET", subtype: "GROUP",          isGroup: true,  balance: 0,        currency: "USD" },
  { id: 11,  code: "1100", name: "Current Assets",          parentId: 1,    type: "ASSET", subtype: "GROUP",          isGroup: true,  balance: 0,        currency: "USD" },
  { id: 111, code: "1101", name: "Cash on Hand — Central",  parentId: 11,   type: "ASSET", subtype: "CASH",           isGroup: false, balance: 840000,   currency: "USD" },
  { id: 112, code: "1102", name: "Cash on Hand — Northgate",   parentId: 11,   type: "ASSET", subtype: "CASH",           isGroup: false, balance: 420000,   currency: "USD" },
  { id: 113, code: "1103", name: "Cash on Hand — Harbour",parentId: 11,   type: "ASSET", subtype: "CASH",           isGroup: false, balance: 180000,   currency: "USD" },
  { id: 114, code: "1110", name: "Anchor Bank Account",        parentId: 11,   type: "ASSET", subtype: "BANK",           isGroup: false, balance: 1840000,  currency: "USD" },
  { id: 115, code: "1111", name: "Meridian Bank Account",     parentId: 11,   type: "ASSET", subtype: "BANK",           isGroup: false, balance: 1240000,  currency: "USD" },
  { id: 116, code: "1112", name: "Vantage Bank Account",        parentId: 11,   type: "ASSET", subtype: "BANK",           isGroup: false, balance: 640000,   currency: "USD" },
  { id: 117, code: "1120", name: "WalletPay Wallet",        parentId: 11,   type: "ASSET", subtype: "WALLET",         isGroup: false, balance: 145000,   currency: "USD" },
  { id: 118, code: "1121", name: "PayLink Wallet",         parentId: 11,   type: "ASSET", subtype: "WALLET",         isGroup: false, balance: 75000,    currency: "USD" },
  { id: 119, code: "1130", name: "Accounts Receivable",     parentId: 11,   type: "ASSET", subtype: "AR",             isGroup: false, balance: 18400000, currency: "USD" },
  { id: 120, code: "1140", name: "Inventory",                parentId: 11,   type: "ASSET", subtype: "INVENTORY",      isGroup: false, balance: 18450000, currency: "USD" },
  { id: 121, code: "1150", name: "Prepaid Expenses",        parentId: 11,   type: "ASSET", subtype: "PREPAID",        isGroup: false, balance: 124000,   currency: "USD" },
  { id: 12,  code: "1200", name: "Fixed Assets",            parentId: 1,    type: "ASSET", subtype: "GROUP",          isGroup: true,  balance: 0,        currency: "USD" },
  { id: 122, code: "1201", name: "Office Equipment",        parentId: 12,   type: "ASSET", subtype: "FIXED",          isGroup: false, balance: 1850000,  currency: "USD" },
  { id: 123, code: "1202", name: "Vehicles",                 parentId: 12,   type: "ASSET", subtype: "FIXED",          isGroup: false, balance: 4200000,  currency: "USD" },

  /* LIABILITIES */
  { id: 2,   code: "2000", name: "Liabilities",             parentId: null, type: "LIABILITY", subtype: "GROUP",      isGroup: true,  balance: 0,        currency: "USD" },
  { id: 21,  code: "2100", name: "Current Liabilities",     parentId: 2,    type: "LIABILITY", subtype: "GROUP",      isGroup: true,  balance: 0,        currency: "USD" },
  { id: 211, code: "2101", name: "Accounts Payable",         parentId: 21,   type: "LIABILITY", subtype: "AP",         isGroup: false, balance: 9620000,  currency: "USD" },
  { id: 212, code: "2102", name: "GR/IR (Goods Received Not Invoiced)", parentId: 21, type: "LIABILITY", subtype: "ACCRUED", isGroup: false, balance: 482000, currency: "USD" },
  { id: 213, code: "2110", name: "Output Sales Tax Payable", parentId: 21,   type: "LIABILITY", subtype: "TAX",        isGroup: false, balance: 1245000,  currency: "USD" },
  { id: 214, code: "2111", name: "Input Sales Tax",          parentId: 21,   type: "LIABILITY", subtype: "TAX",        isGroup: false, balance: 845000,   currency: "USD" },
  { id: 215, code: "2120", name: "WHT Payable",              parentId: 21,   type: "LIABILITY", subtype: "TAX",        isGroup: false, balance: 124000,   currency: "USD" },
  { id: 216, code: "2130", name: "Zakat Payable",            parentId: 21,   type: "LIABILITY", subtype: "ZAKAT",      isGroup: false, balance: 0,        currency: "USD" },

  /* EQUITY */
  { id: 3,   code: "3000", name: "Equity",                   parentId: null, type: "EQUITY",    subtype: "GROUP",      isGroup: true,  balance: 0,        currency: "USD" },
  { id: 31,  code: "3001", name: "Owner's Capital",          parentId: 3,    type: "EQUITY",    subtype: "CAPITAL",    isGroup: false, balance: 12000000, currency: "USD" },
  { id: 32,  code: "3002", name: "Retained Earnings",        parentId: 3,    type: "EQUITY",    subtype: "RETAINED",   isGroup: false, balance: 8240000,  currency: "USD" },

  /* REVENUE */
  { id: 4,   code: "4000", name: "Revenue",                  parentId: null, type: "REVENUE",   subtype: "GROUP",      isGroup: true,  balance: 0,        currency: "USD" },
  { id: 41,  code: "4001", name: "Sales Revenue",            parentId: 4,    type: "REVENUE",   subtype: "SALES",      isGroup: false, balance: 21800000, currency: "USD" },
  { id: 42,  code: "4002", name: "Sales Returns",            parentId: 4,    type: "REVENUE",   subtype: "RETURNS",    isGroup: false, balance: -180000,  currency: "USD" },
  { id: 43,  code: "4010", name: "Other Income",             parentId: 4,    type: "REVENUE",   subtype: "OTHER",      isGroup: false, balance: 24000,    currency: "USD" },

  /* EXPENSE */
  { id: 5,   code: "5000", name: "Expenses",                 parentId: null, type: "EXPENSE",   subtype: "GROUP",      isGroup: true,  balance: 0,        currency: "USD" },
  { id: 51,  code: "5001", name: "Cost of Goods Sold (COGS)",parentId: 5,    type: "EXPENSE",   subtype: "COGS",       isGroup: false, balance: 14500000, currency: "USD" },
  { id: 52,  code: "5101", name: "Salaries & Wages",         parentId: 5,    type: "EXPENSE",   subtype: "OPEX",       isGroup: false, balance: 1840000,  currency: "USD" },
  { id: 53,  code: "5102", name: "Office Rent",              parentId: 5,    type: "EXPENSE",   subtype: "OPEX",       isGroup: false, balance: 480000,   currency: "USD" },
  { id: 54,  code: "5103", name: "Utilities",                parentId: 5,    type: "EXPENSE",   subtype: "OPEX",       isGroup: false, balance: 145000,   currency: "USD" },
  { id: 55,  code: "5104", name: "Vehicle & Fuel",           parentId: 5,    type: "EXPENSE",   subtype: "OPEX",       isGroup: false, balance: 320000,   currency: "USD" },
  { id: 56,  code: "5105", name: "Marketing & Advertising",  parentId: 5,    type: "EXPENSE",   subtype: "OPEX",       isGroup: false, balance: 245000,   currency: "USD" },
  { id: 57,  code: "5106", name: "Bank Charges",             parentId: 5,    type: "EXPENSE",   subtype: "FINANCE",    isGroup: false, balance: 18000,    currency: "USD" },
  { id: 58,  code: "5107", name: "SMS / Communication",      parentId: 5,    type: "EXPENSE",   subtype: "OPEX",       isGroup: false, balance: 12000,    currency: "USD" },
];

/* JOURNAL ENTRIES */
export type JEStatus = "DRAFT" | "POSTED" | "REVERSED";
export type JE = {
  id: number;
  entryNo: string;
  entryDate: string;
  entryType: string;
  reference: string;
  branch: string;
  narration: string;
  totalDebit: number;
  totalCredit: number;
  status: JEStatus;
  postedBy?: string;
  createdBy: string;
};

export const journalEntries: JE[] = [
  { id: 1,  entryNo: "JE-26-1042", entryDate: "2026-04-30", entryType: "SALE",      reference: "INV-CEN-26-0142", branch: "Central",   narration: "Sales invoice posting",                  totalDebit: 145000, totalCredit: 145000, status: "POSTED",   postedBy: "System", createdBy: "System" },
  { id: 2,  entryNo: "JE-26-1041", entryDate: "2026-04-30", entryType: "RECEIPT",   reference: "VCH-CEN-26-0089", branch: "Central",   narration: "Bank receipt — Riverside Plaza #28",       totalDebit: 100000, totalCredit: 100000, status: "POSTED",   postedBy: "Hugo Ramos", createdBy: "Hugo Ramos" },
  { id: 3,  entryNo: "JE-26-1040", entryDate: "2026-04-29", entryType: "PURCHASE",  reference: "GRN-CEN-26-0089", branch: "Central",   narration: "GRN posting — Shenzhen Electronics",     totalDebit: 482000, totalCredit: 482000, status: "POSTED",   postedBy: "System", createdBy: "System" },
  { id: 4,  entryNo: "JE-26-1039", entryDate: "2026-04-29", entryType: "PAYMENT",   reference: "VCH-CEN-26-0088", branch: "Central",   narration: "Bank payment — Apex Accessories",          totalDebit: 320000, totalCredit: 320000, status: "POSTED",   postedBy: "Hugo Ramos", createdBy: "Hugo Ramos" },
  { id: 5,  entryNo: "JE-26-1038", entryDate: "2026-04-28", entryType: "EXPENSE",   reference: "EXP-CEN-26-0024", branch: "Central",   narration: "Office rent — April 2026",                totalDebit: 120000, totalCredit: 120000, status: "POSTED",   postedBy: "Hugo Ramos", createdBy: "Hugo Ramos" },
  { id: 6,  entryNo: "JE-26-1037", entryDate: "2026-04-28", entryType: "JOURNAL",   reference: "—",                branch: "Central",   narration: "Adjustment — bank reconciliation",        totalDebit: 4200,   totalCredit: 4200,   status: "POSTED",   postedBy: "Hugo Ramos", createdBy: "Hugo Ramos" },
  { id: 7,  entryNo: "JE-26-1036", entryDate: "2026-04-27", entryType: "TRANSFER",  reference: "TRF-CEN-26-0012", branch: "Central",   narration: "Stock transfer CEN → NGT (in-transit)",  totalDebit: 245000, totalCredit: 245000, status: "POSTED",   postedBy: "System", createdBy: "System" },
  { id: 8,  entryNo: "JE-26-1043", entryDate: "2026-05-01", entryType: "JOURNAL",   reference: "—",                branch: "Central",   narration: "Depreciation — vehicles April",           totalDebit: 35000,  totalCredit: 35000,  status: "DRAFT",                          createdBy: "Hugo Ramos" },
];

export const JE_STATUS_VARIANT: Record<JEStatus, "success" | "muted" | "danger"> = {
  DRAFT:    "muted",
  POSTED:   "success",
  REVERSED: "danger",
};

/* VOUCHERS */
export type VoucherType = "CR" | "CP" | "BR" | "BP" | "WR" | "WP" | "JV";
export type Voucher = {
  id: number;
  voucherNo: string;
  type: VoucherType;
  typeName: string;
  date: string;
  branch: string;
  partyType: "CUSTOMER" | "SUPPLIER" | "ACCOUNT" | "EMPLOYEE";
  partyName: string;
  amount: number;
  paymentMethod: "CASH" | "BANK" | "EASYPAISA" | "JAZZCASH" | "CHEQUE";
  paymentProvider?: string;
  reference: string;
  narration: string;
  status: "DRAFT" | "POSTED" | "RECONCILED" | "CANCELLED";
  createdBy: string;
};

const VOUCHER_TYPES: Record<VoucherType, string> = {
  CR: "Cash Receipt",
  CP: "Cash Payment",
  BR: "Bank Receipt",
  BP: "Bank Payment",
  WR: "Wallet Receipt",
  WP: "Wallet Payment",
  JV: "Journal Voucher",
};

export const vouchers: Voucher[] = [
  { id: 1, voucherNo: "VCH-CEN-26-0089", type: "BR", typeName: VOUCHER_TYPES.BR, date: "2026-04-30", branch: "Central", partyType: "CUSTOMER", partyName: "Riverside Plaza Shop #28",   amount: 100000, paymentMethod: "BANK",      paymentProvider: "Meridian Bank", reference: "TXN-7748392",  narration: "Payment against INV-128",         status: "POSTED", createdBy: "Hugo Ramos" },
  { id: 2, voucherNo: "VCH-CEN-26-0088", type: "BP", typeName: VOUCHER_TYPES.BP, date: "2026-04-29", branch: "Central", partyType: "SUPPLIER", partyName: "Apex Accessories Imports",  amount: 320000, paymentMethod: "BANK",      paymentProvider: "Anchor Bank",    reference: "CHQ-001245",   narration: "Payment for PI-040",              status: "POSTED", createdBy: "Hugo Ramos" },
  { id: 3, voucherNo: "VCH-CEN-26-0087", type: "CR", typeName: VOUCHER_TYPES.CR, date: "2026-04-29", branch: "Central", partyType: "CUSTOMER", partyName: "Market Row Mobile Plaza",      amount: 32750,  paymentMethod: "CASH",                                       reference: "—",            narration: "Cash receipt over counter",        status: "POSTED", createdBy: "Hugo Ramos" },
  { id: 4, voucherNo: "VCH-CEN-26-0086", type: "WR", typeName: VOUCHER_TYPES.WR, date: "2026-04-28", branch: "Central", partyType: "CUSTOMER", partyName: "Brookside Cellular",          amount: 12400,  paymentMethod: "JAZZCASH",  paymentProvider: "PayLink",    reference: "JC-998877665", narration: "PayLink payment",                 status: "POSTED", createdBy: "Hugo Ramos" },
  { id: 5, voucherNo: "VCH-NGT-26-0034", type: "WR", typeName: VOUCHER_TYPES.WR, date: "2026-04-29", branch: "Northgate",  partyType: "CUSTOMER", partyName: "Mobile Mart Eastvale",       amount: 24600,  paymentMethod: "EASYPAISA", paymentProvider: "WalletPay",   reference: "EP-554433221", narration: "WalletPay payment",                status: "POSTED", createdBy: "Sara Doyle" },
  { id: 6, voucherNo: "VCH-CEN-26-0090", type: "JV", typeName: VOUCHER_TYPES.JV, date: "2026-05-01", branch: "Central", partyType: "ACCOUNT",  partyName: "Multiple",                  amount: 35000,  paymentMethod: "CASH",                                       reference: "—",            narration: "Depreciation entry — April vehicles", status: "DRAFT",                createdBy: "Hugo Ramos" },
];

/* EXPENSES */
export const expenses = [
  { id: 1, expenseNo: "EXP-CEN-26-0024", date: "2026-04-28", category: "Office Rent",       account: "Office Rent",         amount: 120000, vendor: "Market Row Property Holdings",     paidVia: "BANK" as const, status: "POSTED" as const, branch: "Central" },
  { id: 2, expenseNo: "EXP-CEN-26-0023", date: "2026-04-27", category: "Utilities (KE)",    account: "Utilities",            amount: 45000,  vendor: "K-Electric",              paidVia: "BANK" as const, status: "POSTED" as const, branch: "Central" },
  { id: 3, expenseNo: "EXP-CEN-26-0022", date: "2026-04-26", category: "Internet",          account: "Utilities",            amount: 18000,  vendor: "Stormfiber",              paidVia: "BANK" as const, status: "POSTED" as const, branch: "Central" },
  { id: 4, expenseNo: "EXP-CEN-26-0021", date: "2026-04-24", category: "Vehicle Fuel",      account: "Vehicle & Fuel",       amount: 28500,  vendor: "Fleet Fuel Co.",          paidVia: "CASH" as const, status: "POSTED" as const, branch: "Central" },
  { id: 5, expenseNo: "EXP-NGT-26-0014", date: "2026-04-22", category: "Marketing",          account: "Marketing & Advertising", amount: 84000, vendor: "Daraz Sponsored Ads",     paidVia: "BANK" as const, status: "POSTED" as const, branch: "Northgate"  },
  { id: 6, expenseNo: "EXP-CEN-26-0025", date: "2026-04-30", category: "SMS Service",        account: "SMS / Communication",  amount: 12000,  vendor: "Nexa SMS",             paidVia: "BANK" as const, status: "DRAFT" as const,  branch: "Central" },
];
