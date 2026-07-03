// vite.config.ts
import { defineConfig } from "file:///D:/work/program/tineco/UI/a2ui-vue-engine/node_modules/.pnpm/vite@5.4.21/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/work/program/tineco/UI/a2ui-vue-engine/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_vue@3.5.33/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\work\\program\\tineco\\UI\\a2ui-vue-engine\\examples\\crud-demo";
var vite_config_default = defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 3002,
    open: true
  },
  resolve: {
    alias: [
      {
        find: "a2ui-vue-engine/style.css",
        replacement: resolve(__vite_injected_original_dirname, "../../packages/a2ui-vue-engine/src/styles/index.css")
      },
      {
        find: "a2ui-vue-engine",
        replacement: resolve(__vite_injected_original_dirname, "../../packages/a2ui-vue-engine/src/index.ts")
      }
    ]
  },
  optimizeDeps: {
    exclude: ["a2ui-vue-engine"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXHByb2dyYW1cXFxcdGluZWNvXFxcXFVJXFxcXGEydWktdnVlLWVuZ2luZVxcXFxleGFtcGxlc1xcXFxjcnVkLWRlbW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdvcmtcXFxccHJvZ3JhbVxcXFx0aW5lY29cXFxcVUlcXFxcYTJ1aS12dWUtZW5naW5lXFxcXGV4YW1wbGVzXFxcXGNydWQtZGVtb1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd29yay9wcm9ncmFtL3RpbmVjby9VSS9hMnVpLXZ1ZS1lbmdpbmUvZXhhbXBsZXMvY3J1ZC1kZW1vL3ZpdGUuY29uZmlnLnRzXCI7LypcbiAqIEBBdXRob3I6IGh1aS5jaGVublxuICogQERlc2NyaXB0aW9uOiBjcnVkLWRlbW8gVml0ZSBDb25maWdcbiAqICAgLSBcdTc2RjRcdTYzQTVcdTVGMTVcdTc1MjggYTJ1aS12dWUtZW5naW5lIFx1NkU5MFx1NzgwMVx1RkYwQ1x1NjVFMFx1OTcwMFx1NTE0OFx1Njc4NFx1NUVGQVxuICogICAtIFx1N0FFRlx1NTNFMyAzMDAyXHVGRjBDXHU5MDdGXHU1MTREXHU0RTBFIHBsYXlncm91bmQoMzAwMSkgXHU1MUIyXHU3QTgxXG4gKiBARGF0ZTogMjAyNi0wNy0wMiAxMDowMDowMFxuICovXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3Z1ZSgpXSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzEyNy4wLjAuMScsXG4gICAgcG9ydDogMzAwMixcbiAgICBvcGVuOiB0cnVlLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmluZDogJ2EydWktdnVlLWVuZ2luZS9zdHlsZS5jc3MnLFxuICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9hMnVpLXZ1ZS1lbmdpbmUvc3JjL3N0eWxlcy9pbmRleC5jc3MnKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbmQ6ICdhMnVpLXZ1ZS1lbmdpbmUnLFxuICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9hMnVpLXZ1ZS1lbmdpbmUvc3JjL2luZGV4LnRzJyksXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnYTJ1aS12dWUtZW5naW5lJ10sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQU9BLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFUeEIsSUFBTSxtQ0FBbUM7QUFXekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQ2YsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLFFBQVEsa0NBQVcscURBQXFEO0FBQUEsTUFDdkY7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLFFBQVEsa0NBQVcsNkNBQTZDO0FBQUEsTUFDL0U7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGlCQUFpQjtBQUFBLEVBQzdCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
