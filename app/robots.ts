import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/login", "/auth/signup", "/mentions-legales", "/confidentialite", "/cgu"],
        disallow: [
          "/api/",
          "/settings",
          "/onboarding",
          "/invite",
          "/tracking",
          "/agenda",
          "/journal",
          "/duo",
          "/partner",
          "/contractions",
          "/prenoms",
          "/timeline",
          "/bump",
          "/naissance",
          "/baby",
          "/medicaments",
          "/respiration",
          "/communaute",
          "/checklist",
          "/achats",
          "/plus",
          "/alimentation",
          "/urgences",
          "/conseils",
          "/auth/callback",
          "/auth/reset-password",
          "/auth/forgot-password",
        ],
      },
      // Block AI crawlers from scraping protected content
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
    ],
    sitemap: "https://mamatrack.fr/sitemap.xml",
  };
}
