// Reuse the docs workspace's installed Playwright without adding dependencies:
// pnpm --filter @gntik-ai/docs exec playwright test --config ../example-next/playwright.config.js
export default {
  testDir: '../docs/e2e',
  testMatch: 'example-next.csp.spec.js',
  use: { baseURL: 'http://localhost:3001', browserName: 'chromium', reducedMotion: 'reduce' },
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3001/csp',
    reuseExistingServer: false,
    timeout: 300000,
  },
};
