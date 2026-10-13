import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

const site = process.env.TABLE_LABELS_SITE;
if (!site) throw new Error('Run pnpm test:table-labels to build and compare the immutable baseline.');
const quotedSite = `'${site.replaceAll("'", "'\\''")}'`;

export default defineConfig({
  ...base,
  testMatch: 'table-labels.spec.js',
  timeout: 180000,
  // Baselines are captured from dde54ce into an external artifact directory, never committed.
  snapshotPathTemplate: `${process.env.TABLE_LABELS_SNAPSHOT_DIR ?? '/tmp/gntik-issue30-visual-baseline'}/{arg}{ext}`,
  webServer: {
    ...base.webServer,
    command: `pnpm exec vite preview --outDir ${quotedSite} --port 4173 --strictPort`,
    reuseExistingServer: false,
  },
});
