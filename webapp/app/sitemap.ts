import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Set the current date for lastModified
  const currentDate = new Date().toISOString();

  // Define your site URLs with their properties
  return [
    {
      url: "https://www.expobuilder.app/",
      lastModified: currentDate,
      priority: 1.0,
    },
    {
      url: "https://www.expobuilder.app/docs",
      lastModified: currentDate,
      priority: 0.8,
    },
    {
      url: "https://www.expobuilder.app/docs?tab=examples",
      lastModified: currentDate,
      priority: 0.8,
    },
    {
      url: "https://www.expobuilder.app/docs?tab=faq",
      lastModified: currentDate,
      priority: 0.8,
    },
    // You can add more URLs as your site grows
  ];
}
