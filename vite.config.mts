import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment (e.g., https://username.github.io/repo-name/)
  // Change 'Prueba-Security-Summit' to your actual repository name
  base: process.env.NODE_ENV === "production" ? "/Prueba-Security-Summit/" : "/",
  server: {
    port: 5173
  },
  build: {
    outDir: "dist"
  }
});
