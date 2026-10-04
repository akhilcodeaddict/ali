import type { MetadataRoute } from "next";

// The CMS admin is private; nothing here should be crawled.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
