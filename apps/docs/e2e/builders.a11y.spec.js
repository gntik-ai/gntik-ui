import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const CSP =
  "default-src 'self'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'";

test('consumer YAML diagnostics come back from the yaml Worker under production CSP', async ({ page, context }) => {
  const external = [];
  const assets = [];
  context.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (url.origin !== 'http://localhost:4173') external.push(url.href);
      else assets.push(url.pathname);
    }
  });
  await page.addInitScript(() => {
    window.workerEvidence = [];
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => window.cspViolations.push(e.violatedDirective));
    let environment;
    Object.defineProperty(window, 'MonacoEnvironment', {
      configurable: true,
      get: () => environment,
      set: (value) => {
        const factory = value.getWorker;
        environment = {
          ...value,
          getWorker: (id, label) => {
            const result = factory(id, label);
            Promise.resolve(result).then((worker) => {
              const evidence = {
                label,
                isWorker: worker instanceof Worker,
                messages: [],
              };
              window.workerEvidence.push(evidence);
              worker.addEventListener('message', (event) => evidence.messages.push(JSON.stringify(event.data)));
            });
            return result;
          },
        };
      },
    });
  });
  await page.route('**/builders.html*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': CSP },
    });
  });
  await page.goto('/builders.html?item=code-panel');
  const before = assets.length;
  expect(await page.evaluate(() => window.workerEvidence)).toEqual([]);
  expect(assets.some((url) => /yaml\.worker|editor\.worker/.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Open YAML editor' }).click();
  await expect(page.getByRole('list', { name: 'Problems' })).toContainText('integer');
  await expect(page.getByRole('list', { name: 'Problems' })).toContainText('Review the terminal step');
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.workerEvidence.some((e) => {
          const hasDiagnostic = (value) => {
            if (!value || typeof value !== 'object') return false;
            if (typeof value.message === 'string' && value.message.includes('integer') && value.range) return true;
            return Object.values(value).some(hasDiagnostic);
          };
          return e.label === 'yaml' && e.isWorker && e.messages.some((m) => hasDiagnostic(JSON.parse(m)));
        }),
      ),
    )
    .toBe(true);
  // Probe the editor-worker route as well; YAML's service may be the only worker demanded by a short document.
  await page.evaluate(() => {
    window.MonacoEnvironment.getWorker('editor-probe', 'editorWorkerService');
  });
  await expect
    .poll(() => page.evaluate(() => window.workerEvidence.some((e) => e.label === 'editorWorkerService' && e.isWorker)))
    .toBe(true);
  expect(assets.length).toBeGreaterThan(before);
  expect(external).toEqual([]);
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
  // Main-thread fallback cannot satisfy the Worker evidence above.
  const editor = page.getByRole('textbox', { name: /flow.yaml/ });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('count: 3');
  await expect(page.getByText('0 errors · 1 warning')).toBeVisible();
  expect(external).toEqual([]);
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
});

test('connection rules reject a dragged custom handle before adding an edge', async ({ page }) => {
  await page.goto('/builders.html?item=flow-builder');
  const source = page.locator('[data-nodeid="branch"][data-handleid="arm-0"]');
  const target = page.locator('[data-nodeid="branch"][data-handleid="input"]');
  await expect(source).toBeVisible();
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('Connection handles are not laid out');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole('list', { name: 'Flow problems' })).toContainText('A node cannot connect to itself');
  await expect(page.locator('.react-flow__edge')).toHaveCount(0);
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const mode of ['edit', 'run']) {
    for (const item of ['flow-builder', 'workflow-builder', 'code-panel']) {
      test(`${item} ${mode} axe ${theme}`, async ({ page }) => {
        await page.goto(`/builders.html?item=${item}&mode=${mode}&theme=${theme}`);
        if (item === 'code-panel') {
          await page.getByRole('button', { name: 'Open YAML editor' }).click();
          await expect(page.getByRole('list', { name: 'Problems' })).toContainText('integer');
        } else {
          await expect(page.getByText('Branch', { exact: true }).first()).toBeVisible();
        }
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(AXE);
        const violations = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const result = await axe.run(document.querySelector('main'), {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
            },
          });
          return result.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          }));
        });
        expect(violations).toEqual([]);
        if (mode === 'run' && item === 'code-panel') {
          const editor = page.getByRole('textbox', { name: /flow.yaml/ });
          await editor.click();
          await page.keyboard.press('ControlOrMeta+A');
          await page.keyboard.type('count: 3');
          await expect(page.getByRole('list', { name: 'Problems' })).toContainText('integer');
        }
      });
    }
  }
}
