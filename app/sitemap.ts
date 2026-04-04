import type { MetadataRoute } from "next";
import { SHOPS } from "@/lib/data";
import { SITE_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_ORIGIN;

  const shopRoutes = SHOPS.map((shop) => ({
    url: `${base}/shop/${shop.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...shopRoutes,
  ];
}
