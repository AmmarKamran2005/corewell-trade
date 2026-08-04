import type { MetadataRoute } from "next";

/**
 * The demo must never be indexed.
 *
 * It carries invented customers, invented order numbers and invented balances.
 * Letting a search engine index that puts fabricated business records into
 * results, and competes with corewellsystems.com for the company's own terms.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
