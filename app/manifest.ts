import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barbellist",
    short_name: "Barbellist",
    description:
      "The calm, all-in-one gym management platform for independent gyms.",
    start_url: "/home",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#1B5E3C",
    icons: [
      {
        src: "/logo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
