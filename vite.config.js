import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({root:resolve('client'),base:'./',publicDir:resolve('public'),build:{outDir:resolve('dist'),emptyOutDir:true,assetsDir:'build'}});
