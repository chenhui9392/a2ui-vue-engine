// vite.config.ts
import { defineConfig } from "file:///D:/work/program/tineco/UI/a2ui-vue-engine/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.39/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/work/program/tineco/UI/a2ui-vue-engine/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_@types+node@20.19.39__vue@3.5.32_typescript@5.9.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
import dts from "file:///D:/work/program/tineco/UI/a2ui-vue-engine/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.19.39_rollup@4.60.1_typescript@5.9.3_vite@5.4.21_@types+node@20.19.39_/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\work\\program\\tineco\\UI\\a2ui-vue-engine\\packages\\a2ui-vue-engine";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: "dist"
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "A2UIVueEngine",
      fileName: "a2ui-vue-engine"
    },
    rollupOptions: {
      external: ["vue", "element-plus", "element-plus/es", "element-plus/es/components/message/style/css", "@element-plus/icons-vue"],
      output: {
        globals: {
          vue: "Vue",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue"
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXHByb2dyYW1cXFxcdGluZWNvXFxcXFVJXFxcXGEydWktdnVlLWVuZ2luZVxcXFxwYWNrYWdlc1xcXFxhMnVpLXZ1ZS1lbmdpbmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdvcmtcXFxccHJvZ3JhbVxcXFx0aW5lY29cXFxcVUlcXFxcYTJ1aS12dWUtZW5naW5lXFxcXHBhY2thZ2VzXFxcXGEydWktdnVlLWVuZ2luZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd29yay9wcm9ncmFtL3RpbmVjby9VSS9hMnVpLXZ1ZS1lbmdpbmUvcGFja2FnZXMvYTJ1aS12dWUtZW5naW5lL3ZpdGUuY29uZmlnLnRzXCI7LypcclxuICogQEF1dGhvcjogaHVpLmNoZW5uXHJcbiAqIEBEZXNjcmlwdGlvbjogXHJcbiAqIEBEYXRlOiAyMDI2LTA0LTE1IDE1OjMxOjI1XHJcbiAqIEBMYXN0RWRpdFRpbWU6IDIwMjYtMDQtMTUgMTU6MzE6NTBcclxuICogQExhc3RFZGl0b3JzOiBodWkuY2hlbm5cclxuICovXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcclxuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgZHRzKHtcclxuICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcclxuICAgICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXHJcbiAgICAgIG5hbWU6ICdBMlVJVnVlRW5naW5lJyxcclxuICAgICAgZmlsZU5hbWU6ICdhMnVpLXZ1ZS1lbmdpbmUnLFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ2VsZW1lbnQtcGx1cycsICdlbGVtZW50LXBsdXMvZXMnLCAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvbWVzc2FnZS9zdHlsZS9jc3MnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnXSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgdnVlOiAnVnVlJyxcclxuICAgICAgICAgICdlbGVtZW50LXBsdXMnOiAnRWxlbWVudFBsdXMnLFxyXG4gICAgICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJzogJ0VsZW1lbnRQbHVzSWNvbnNWdWUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFPQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sU0FBUztBQVZoQixJQUFNLG1DQUFtQztBQVl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsTUFDRixrQkFBa0I7QUFBQSxNQUNsQixRQUFRO0FBQUEsSUFDVixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLE9BQU8sZ0JBQWdCLG1CQUFtQixnREFBZ0QseUJBQXlCO0FBQUEsTUFDOUgsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1AsS0FBSztBQUFBLFVBQ0wsZ0JBQWdCO0FBQUEsVUFDaEIsMkJBQTJCO0FBQUEsUUFDN0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
