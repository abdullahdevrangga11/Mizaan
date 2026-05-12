import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://mizaan-ivory.vercel.app";
  const lastModified = new Date();
  const locales = ["id", "en"] as const;
  const routes = ["", "/donate", "/verify", "/feed", "/laz"];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.7,
    })),
  );
}
