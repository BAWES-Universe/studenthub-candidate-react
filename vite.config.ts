/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

//const fs = require('node:fs');

const sentryRelease =
  process.env.VITE_SENTRY_RELEASE ||
  (process.env.COMMIT_REF ? `sh-student-app@${process.env.COMMIT_REF}` : undefined);

const sentryUploadEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN && sentryRelease);

// https://vitejs.dev/config/
export default defineConfig({

  build: {
    sourcemap: sentryUploadEnabled ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'axios'],
          i18n: ['i18next', 'react-i18next'],
          store: ['redux', '@reduxjs/toolkit'],
          router: ['react-router', 'react-router-dom'],
          // Add more chunks as needed
        }
      }
    },
    commonjsOptions: {
    //  strictRequires: ['node_modules/aws-sdk/clients/s3.js'],
    },
    chunkSizeWarningLimit: 1500, // Increase limit to 1000 kB
  },
  server: {
    /*https: {
      key: 'ssl/private-key.pem',
      cert: 'ssl/certificate.pem',
    },*/
    hmr: {
      overlay: false,
    },
    //port: 810,
  },
  /*preview: {
    port: 8100,
  },*/
  resolve: {
    alias: {
      '@': "/src",
    },
  },
  define: {
    'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(sentryRelease || ''),
  },
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate', 
      workbox: { maximumFileSizeToCacheInBytes: 5000000 } 
    }),
    legacy(),
    ...(sentryUploadEnabled
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: {
              name: sentryRelease,
              setCommits: { auto: true },
            },
            sourcemaps: {
              filesToDeleteAfterUpload: ['./dist/**/*.map'],
            },
          }),
        ]
      : []),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
