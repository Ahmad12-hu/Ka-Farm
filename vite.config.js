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
          login: path.resolve(__dirname, 'pages/auth/login.html'),
          signup: path.resolve(__dirname, 'pages/auth/signup.html'),
          alerts: path.resolve(__dirname, 'pages/shared/alerts.html'),
          crops: path.resolve(__dirname, 'pages/shared/crops.html'),
          dashboard: path.resolve(__dirname, 'pages/shared/dashboard.html'),
          finances: path.resolve(__dirname, 'pages/shared/finances.html'),
          harvest: path.resolve(__dirname, 'pages/shared/harvest.html'),
          irrigation: path.resolve(__dirname, 'pages/shared/irrigation.html'),
          parcelles: path.resolve(__dirname, 'pages/shared/parcelles.html'),
          employees: path.resolve(__dirname, 'pages/shared/employees.html'),
          stocks: path.resolve(__dirname, 'pages/shared/stocks.html'),
          sales: path.resolve(__dirname, 'pages/personal/my-sales.html'),
          tasks: path.resolve(__dirname, 'pages/personal/my-tasks.html'),
          profile: path.resolve(__dirname, 'pages/personal/profile.html'),
          settings: path.resolve(__dirname, 'pages/personal/settings.html'),
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
