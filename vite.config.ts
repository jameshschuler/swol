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
      registerType: 'autoUpdate',
      includeAssets: [
        "assets/*.png",
      ],
      strategies: "injectManifest",
      manifest: {
        name: "Swol",
        short_name: "Swol",
        description: 'Swol is a collection of strength sports tools.',
        theme_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        icons: [
          {
            src: "/assets/SWOLa36.png",
            sizes: "36x36",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa120.png",
            sizes: "120x120",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/assets/SWOLa167.png",
            sizes: "167x167",
            type: "image/png",
          },
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
        ],
      }
    } ) ]
} );
