import type { MetadataRoute } from "next";

const siteUrl = "https://www.smatpic.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    {
      path: "/",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      path: "/business-management-software",
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      path: "/pos-system",
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      path: "/inventory-management",
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      path: "/sales-management",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      path: "/purchasing-management",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      path: "/solutions/pharmacy",
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      path: "/solutions/supermarket",
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      path: "/solutions/retail",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      path: "/solutions/boutique",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
