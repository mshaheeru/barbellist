import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/home", "/login", "/signup"],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: "https://barbellist.com/sitemap.xml",
  };
}
