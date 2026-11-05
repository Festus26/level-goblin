import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'shared', include: ['shared/test/**/*.test.ts'] } },
      {
        test: {
          name: 'worker',
          include: ['worker/test/**/*.test.ts'],
          globalSetup: ['worker/test/setup.ts'],
          testTimeout: 15000,
          hookTimeout: 60000,
        },
      },
    ],
  },
});
