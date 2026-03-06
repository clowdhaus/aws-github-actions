import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['*/index.ts', 'packages/*/index.ts'],
      exclude: ['**/dist/**', '**/lib/**', '**/node_modules/**'],
    },
  },
});
