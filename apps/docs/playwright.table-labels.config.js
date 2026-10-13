import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testMatch: 'table-labels.*.spec.js',
  timeout: 180000,
  // Baselines are captured from dde54ce into an external artifact directory, never committed.
  snapshotPathTemplate: `${process.env.TABLE_LABELS_SNAPSHOT_DIR ?? '/tmp/gntik-issue30-visual-baseline'}/{arg}{ext}`,
});
