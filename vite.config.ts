import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: './',
  assetsInclude: [/.*zip$/, /.*ttf$/],
  plugins: [viteTsconfigPaths(), solidPlugin()],
  resolve: {
    conditions: ["browser"],
  },
});
