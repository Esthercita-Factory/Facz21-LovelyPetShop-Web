import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

function fixHashInPath() {
  return {
    name: 'fix-hash-in-path',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
      if (source.startsWith('.') && importer) {
        const dir = path.dirname(importer.split('?')[0]);
        const target = path.resolve(dir, source);
        const candidates = [
          target,
          target + '.tsx',
          target + '.ts',
          target + '.jsx',
          target + '.js',
          target + '.json',
          path.join(target, 'index.tsx'),
          path.join(target, 'index.ts'),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c) && fs.statSync(c).isFile()) {
            return c;
          }
        }
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    fixHashInPath(),
    react(),
    tailwindcss()
  ],
  build: {
    outDir: path.resolve(__dirname, '../LovelyPetShop.API/wwwroot'),
    emptyOutDir: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5108',
        changeOrigin: true
      }
    }
  }
});
