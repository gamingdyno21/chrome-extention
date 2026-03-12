import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    // Copy static extension assets into dist/ after build
    viteStaticCopy({
      targets: [
        // The compiled background.js (service worker) — placed at dist root
        { src: "src/background/background.js", dest: "." },
        // Icons
        { src: "public/icons", dest: "." },
        // Manifest
        { src: "manifest.json", dest: "." }
      ]
    })
  ],
  build: {
    outDir:      "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup:     resolve(__dirname, "popup.html"),
        dashboard: resolve(__dirname, "dashboard.html")
      },
      output: {
        // Keep entry point names predictable for manifest references
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
