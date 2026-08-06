import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

/**
 * One entry, deliberately.
 *
 * The sign-in page is the only page here that should be a search result — it
 * is the door, and it explains what is behind it. Everything past it is
 * fabricated sample data, so listing it would be asking a search engine to
 * index records of a company that does not exist.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${brand.demoUrl}/login`,
      lastModified: new Date("2026-08-05"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
