import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && // lovable-tagger removed
    // componentTagger(), // lovable-tagger removed
  ].filter(Boolean),
  // resolve: { // path and alias removed
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //   },
  // },
}));
