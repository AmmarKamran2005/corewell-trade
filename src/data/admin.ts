/**
 * Mock data for admin module: warehouses, users, roles, branches.
 */

import { initials } from "@/lib/format";

export type Warehouse = {
  id: number;
  code: string;
  name: string;
  city: string;
  branchId: number;
  managerId: number;
  isActive: boolean;
  productCount: number;
  totalValue: number;
};

export const warehouses: Warehouse[] = [
  { id: 1, code: "CEN-WH-01", name: "Central Main Warehouse", city: "Central · Market Row",        branchId: 1, managerId: 2, isActive: true, productCount: 28, totalValue: 18450000 },
  { id: 2, code: "CEN-WH-02", name: "Central Damaged Goods",  city: "Central · Market Row",        branchId: 1, managerId: 2, isActive: true, productCount: 14, totalValue: 245000 },
  { id: 3, code: "NGT-WH-01", name: "Northgate Distribution",    city: "Northgate · Riverside Plaza",  branchId: 2, managerId: 3, isActive: true, productCount: 26, totalValue: 12480000 },
  { id: 4, code: "HBR-WH-01", name: "Harbour Hub",          city: "Harbour · Quarter",   branchId: 3, managerId: 4, isActive: true, productCount: 22, totalValue: 8240000 },
];

export type Branch = {
  id: number;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
  isHeadOffice: boolean;
  isActive: boolean;
  invoicePrefix: string;
  poPrefix: string;
  voucherPrefix: string;
  warehouseCount: number;
  userCount: number;
  monthlyRevenue: number;
};

export const branchesAdmin: Branch[] = [
  { id: 1, code: "CEN", name: "Central Head Office", city: "Central", address: "Nortex House, 42 Trade Park Road, Central", phone: "021 32412345", manager: "Alex Hartley",  isHeadOffice: true,  isActive: true, invoicePrefix: "CEN-INV", poPrefix: "CEN-PO", voucherPrefix: "CEN-VCH", warehouseCount: 2, userCount: 12, monthlyRevenue: 12400000 },
  { id: 2, code: "NGT", name: "Northgate Branch",       city: "Northgate",  address: "Riverside Plaza, Northgate",            phone: "042 35712345", manager: "Sara Doyle",   isHeadOffice: false, isActive: true, invoicePrefix: "NGT-INV", poPrefix: "NGT-PO", voucherPrefix: "NGT-VCH", warehouseCount: 1, userCount: 8,  monthlyRevenue: 6850000 },
  { id: 3, code: "HBR", name: "Harbour Branch",    city: "Harbour", address: "Harbour Quarter",            phone: "051 22812345", manager: "Ben Alder", isHeadOffice: false, isActive: true, invoicePrefix: "HBR-INV", poPrefix: "HBR-PO", voucherPrefix: "HBR-VCH", warehouseCount: 1, userCount: 5,  monthlyRevenue: 2570000 },
];

export type Role = {
  id: number;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
};

export const roles: Role[] = [
  { id: 1, name: "SuperAdmin",        description: "Full system access — all modules, all branches",       isSystem: true,  userCount: 1,  permissionCount: 87 },
  { id: 2, name: "Accountant",        description: "Accounting, vouchers, expenses, reports",              isSystem: true,  userCount: 3,  permissionCount: 42 },
  { id: 3, name: "Order Department",  description: "Process orders, dispatch, returns, credit decisions",   isSystem: true,  userCount: 6,  permissionCount: 28 },
  { id: 4, name: "Sales",             description: "Create orders & customers, view own reports only",     isSystem: true,  userCount: 8,  permissionCount: 18 },
  { id: 5, name: "Purchase Officer",  description: "Create POs, GRNs, supplier management",                isSystem: false, userCount: 2,  permissionCount: 22 },
  { id: 6, name: "Branch Manager",    description: "Branch-scoped accounting, sales oversight",            isSystem: false, userCount: 3,  permissionCount: 56 },
  { id: 7, name: "Collections",       description: "AR aging, payment recording, customer follow-ups",     isSystem: false, userCount: 2,  permissionCount: 14 },
];

export type User = {
  id: number;
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  employeeCode: string;
  roles: string[];
  branches: string[];
  isActive: boolean;
  isLocked: boolean;
  lastLoginAt: string;
  createdAt: string;
};

const u = (
  id: number,
  fullName: string,
  email: string,
  phone: string,
  empCode: string,
  roles: string[],
  branches: string[],
  isActive: boolean,
  lastLogin: string
): User => ({
  id,
  fullName,
  initials: initials(fullName),
  email,
  phone,
  employeeCode: empCode,
  roles,
  branches,
  isActive,
  isLocked: false,
  lastLoginAt: lastLogin,
  createdAt: "2025-08-01",
});

export const users: User[] = [
  u(1,  "Alex Hartley",     "adnan@nortex.demo",          "555 06778", "EMP-001", ["SuperAdmin"],         ["CEN", "NGT", "HBR"], true,  "2 min ago"),
  u(2,  "Hugo Ramos",    "hassan@nortex.demo",        "555 04567", "EMP-002", ["Accountant"],         ["CEN"],               true,  "12 min ago"),
  u(3,  "Sara Doyle",      "sara@nortex.demo",          "555 05678", "EMP-003", ["Sales"],              ["NGT"],               true,  "5 min ago"),
  u(4,  "Ben Alder",    "bilal@nortex.demo",         "555 06789", "EMP-004", ["Order Department"],   ["CEN"],               true,  "1 hour ago"),
  u(5,  "Elena Ross",  "fatima@nortex.demo",        "555 07890", "EMP-005", ["Branch Manager"],     ["NGT"],               true,  "3 hours ago"),
  u(6,  "Adam Rios",     "ahmed@nortex.demo",         "555 08901", "EMP-006", ["Purchase Officer"],   ["CEN"],               true,  "Yesterday"),
  u(7,  "Zara Malik",     "zara@nortex.demo",          "555 09012", "EMP-007", ["Sales"],              ["CEN"],               true,  "30 min ago"),
  u(8,  "Ivan Kohl",    "imran@nortex.demo",         "555 00123", "EMP-008", ["Sales"],              ["NGT"],               true,  "2 hours ago"),
  u(9,  "Nadia Hollis",  "nadia@nortex.demo",         "555 01234", "EMP-009", ["Accountant"],         ["NGT"],               true,  "1 day ago"),
  u(10, "Jonas Aker",  "junaid@nortex.demo",        "555 02345", "EMP-010", ["Order Department"],   ["HBR"],               true,  "4 hours ago"),
  u(11, "Rabia Yousaf",   "rabia@nortex.demo",         "555 03456", "EMP-011", ["Collections"],        ["CEN"],               true,  "6 hours ago"),
  u(12, "Andre Sallis",       "asad@nortex.demo",          "555 04567", "EMP-012", ["Sales"],              ["CEN"],               false, "5 days ago"),
];

export function getUser(id: number) {
  return users.find((u) => u.id === id);
}

export function getRole(id: number) {
  return roles.find((r) => r.id === id);
}

export function getBranch(id: number) {
  return branchesAdmin.find((b) => b.id === id);
}

export function getWarehouse(id: number) {
  return warehouses.find((w) => w.id === id);
}
