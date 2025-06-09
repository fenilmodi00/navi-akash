import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  tsconfig: './tsconfig.json',
  sourcemap: true,
  clean: true,
  format: ['esm'],
  dts: true,
  external: [
    'dotenv',
    'fs',
    'path',
    'https',
    'http',
    'zod',
  ],
});
