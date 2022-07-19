import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig( {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/app.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve( __dirname, './src' ),
    },
  },
  plugins: [
    vue(),
    VitePWA( {
      mode: "development",
      base: "/",
      srcDir: "src",
      filename: "sw.ts",
      includeAssets: [ "assets/SWOLa180.png", "assets/SWOLa192.png", "/favicon.png" ],
      strategies: "injectManifest",
      manifest: {
        name: "Swol",
        short_name: "Swol",
        theme_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        icons: [
          {
            src: "/assets/SWOLa180.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      }
    } ) ]
} );
