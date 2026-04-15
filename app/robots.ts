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
          "/auth/callback",
          "/auth/reset-password",
          "/auth/forgot-password",
        ],
      },
    ],
    sitemap: "https://mamatrack.fr/sitemap.xml",
  };
}
