import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testMatch: 'block-labels.a11y.spec.js',
  testIgnore: [],
  // Capture the immutable baseline during each test; never update or commit catalog screenshots.
  outputDir: '../../node_modules/.cache/block-label-test-results',
  snapshotDir: '../../node_modules/.cache/block-label-snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{testName}/{arg}{ext}',
  timeout: 300_000,
  webServer: {
    command:
      'pnpm exec vite build --config vite.labels.config.js && pnpm exec vite preview --config vite.labels.config.js --port 4173 --strictPort',
    url: 'http://localhost:4173/e2e/fixtures/block-labels.html',
    timeout: 300_000,
    reuseExistingServer: false,
  },
});
