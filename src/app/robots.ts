import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

/**
 * The landing page is indexable; the system behind it is not.
 *
 * Someone searching "distribution ERP demo" should be able to find this and
 * land on the sign-in page, which explains what the system is. What must stay
 * out of the index is everything past it: those screens carry invented
 * customers, invented order numbers and invented balances, and fabricated
 * business records do not belong in search results. They are also close to
 * textless — tables and forms — so indexing them would be thin content on a
 * subdomain of the company's own name.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: [
        "/dashboard",
        "/sales/",
        "/purchases/",
        "/inventory/",
        "/parties/",
        "/accounting/",
        "/reports/",
        "/admin/",
        "/notifications/",
        "/profile/",
        "/zakat/",
        "/ai-assistant",
        "/pos",
        "/store",
        "/setup",
        "/forgot-password",
        "/reset-password",
        "/locked",
      ],
    },
    sitemap: `${brand.demoUrl}/sitemap.xml`,
  };
}
