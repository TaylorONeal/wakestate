import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "fs";
import { VitePWA } from "vite-plugin-pwa";

const appVersion = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf8")).version as string;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
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
}));
