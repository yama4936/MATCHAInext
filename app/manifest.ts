import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MATCHAI",
    short_name: "MATCHAI",
    description: "集合がもっと楽になるアプリ",
    start_url: "/",
    display: "standalone",
    theme_color: "#F9F8F7",
    background_color: "#F9F8F7",
    "icons": [
      {
        "purpose": "maskable",
        "sizes": "512x512",
        "src": "/icons/icon512_maskable.png",
        "type": "image/png",
      },
      {
        "purpose": "any",
        "sizes": "512x512",
        "src": "/icons/icon512_rounded.png",
        "type": "image/png",
      },
    ],
  };
}
