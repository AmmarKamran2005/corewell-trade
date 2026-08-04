/**
 * Corewell Trade — single source of truth for product & company identity.
 *
 * Every user-visible mention of the product, the company, or the demo notice
 * reads from here. Renaming the product is a one-line change in this file.
 */

export const brand = {
  /** Product name, as shown in the UI. */
  product: "Corewell Trade",
  /** Split form, so the wordmark can accent the second half. */
  productParts: { lead: "Corewell", accent: "Trade" },
  /** One-line description of what the product is. */
  tagline: "Sales · Inventory · Accounting",
  /** Longer positioning line, used on the sign-in panel and metadata. */
  description:
    "Multi-branch sales, purchases, inventory and double-entry accounting in one system.",

  /** The company that builds it. */
  company: "Corewell Systems",
  companyUrl: "https://corewellsystems.com",
  contactEmail: "contact@corewellsystems.com",
  /** Rendered in footers as "© {year} {company}". */
  copyrightYear: 2026,

  /** Release label shown in the sidebar footer. */
  version: "v2.0",
  build: "2026.05",
} as const;

/** "Developed by Corewell Systems" — used verbatim in app footers. */
export const developedBy = `Developed by ${brand.company}`;

/** "© 2026 Corewell Systems. All rights reserved." */
export const copyright = `© ${brand.copyrightYear} ${brand.company}. All rights reserved.`;

/**
 * The fictional business this demo is seeded for. Kept separate from `brand`
 * so sample data is never mistaken for the product or the company.
 */
export const demoTenant = {
  name: "Nortex Traders",
  descriptor: "mobile-accessories distribution",
  emailDomain: "nortex.demo",
} as const;
