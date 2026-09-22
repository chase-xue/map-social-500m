import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  base: '/map-social-500m/',
  server: {
    port: 5173,
    host: "0.0.0.0"
  }
});
