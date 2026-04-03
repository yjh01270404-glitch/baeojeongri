import type { MetadataRoute } from "next";
import { SHOPS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://baeojeongri.vercel.app";

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
