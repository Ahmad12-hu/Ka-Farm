import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          // Pages auth
          'pages/auth/login': path.resolve(__dirname, 'pages/auth/login.html'),
          'pages/auth/signup': path.resolve(__dirname, 'pages/auth/signup.html'),
          // Pages shared
          'pages/shared/alerts': path.resolve(__dirname, 'pages/shared/alerts.html'),
          'pages/shared/crops': path.resolve(__dirname, 'pages/shared/crops.html'),
          'pages/shared/dashboard': path.resolve(__dirname, 'pages/shared/dashboard.html'),
          'pages/shared/finances': path.resolve(__dirname, 'pages/shared/finances.html'),
          'pages/shared/harvest': path.resolve(__dirname, 'pages/shared/harvest.html'),
          'pages/shared/irrigation': path.resolve(__dirname, 'pages/shared/irrigation.html'),
          'pages/shared/parcelles': path.resolve(__dirname, 'pages/shared/parcelles.html'),
          'pages/shared/employees': path.resolve(__dirname, 'pages/shared/employees.html'),
          'pages/shared/stocks': path.resolve(__dirname, 'pages/shared/stocks.html'),
          'pages/shared/elevage': path.resolve(__dirname, 'pages/shared/elevage.html'),
          'pages/shared/training': path.resolve(__dirname, 'pages/shared/training.html'),
          'pages/shared/discussion': path.resolve(__dirname, 'pages/shared/discussion.html'),
          'pages/shared/treatments': path.resolve(__dirname, 'pages/shared/treatments.html'),
          'pages/shared/profitability': path.resolve(__dirname, 'pages/shared/profitability.html'),
          'pages/shared/market-prices': path.resolve(__dirname, 'pages/shared/market-prices.html'),
          'pages/shared/tools-sharing': path.resolve(__dirname, 'pages/shared/tools-sharing.html'),
          'pages/shared/calendar': path.resolve(__dirname, 'pages/shared/calendar.html'),
          // Pages admin
          'pages/admin/login': path.resolve(__dirname, 'pages/admin/login.html'),
          'pages/admin/dashboard': path.resolve(__dirname, 'pages/admin/dashboard.html'),
          // Pages personal
          'pages/personal/my-sales': path.resolve(__dirname, 'pages/personal/my-sales.html'),
          'pages/personal/my-tasks': path.resolve(__dirname, 'pages/personal/my-tasks.html'),
          'pages/personal/profile': path.resolve(__dirname, 'pages/personal/profile.html'),
          'pages/personal/settings': path.resolve(__dirname, 'pages/personal/settings.html'),
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
