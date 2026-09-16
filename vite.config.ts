import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const origin = loadEnv(mode, process.cwd(), "VITE_PUBLIC_ORIGIN").VITE_PUBLIC_ORIGIN;
  if (origin && (new URL(origin).protocol !== "https:" || new URL(origin).origin !== origin)) {
    throw new Error("VITE_PUBLIC_ORIGIN must be an HTTPS origin without a trailing slash or path");
  }
  return ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: "owned-social-image-url",
      transformIndexHtml: (html) => origin ? html.replaceAll('content="/og-image.png"', `content="${origin}/og-image.png"`) : html,
    },
    mode !== "native" && VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-192.png", "pwa-512.png", "pwa-maskable-512.png"],
      manifest: {
        name: "WakeState",
        short_name: "WakeState",
        description: "Track wake-state patterns for narcolepsy management",
        theme_color: "#111b1e",
        background_color: "#111b1e",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],

      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
});
