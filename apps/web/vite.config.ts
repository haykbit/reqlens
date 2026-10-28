import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 7331,
    strictPort: false,
    proxy: {
      "/api": "http://127.0.0.1:7332",
    },
  },
  test: {
    environment: "jsdom",
  },
});
