import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const lines = (count) => Array.from({ length: count }, (_, index) => `Line ${index + 1}`).join('\n');

async function openExample(page, theme, fallback) {
  await page.addInitScript(
    ({ theme, fallback }) => {
      localStorage.setItem('gntik-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('gntik-section', 'ui-components');
      if (fallback) {
        const supports = CSS.supports.bind(CSS);
        CSS.supports = (...args) => (args[0] === 'field-sizing' ? false : supports(...args));
      }
    },
    { theme, fallback },
  );
  await page.goto('/#ui-components/textarea');
  const example = page.locator('[data-textarea-autosize-bounded]');
  await expect(example).toBeVisible();
  return example;
}

async function metrics(field) {
  return field.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    scrollTop: element.scrollTop,
    inlineHeight: element.style.height,
  }));
}

for (const fallback of [false, true]) {
  for (const theme of ['dark', 'light', 'high_contrast']) {
    test(`Textarea autosize bounds ${fallback ? 'fallback' : 'native'} — ${theme}`, async ({ page }) => {
      const example = await openExample(page, theme, fallback);
      if (!fallback) expect(await page.evaluate(() => CSS.supports('field-sizing', 'content'))).toBe(true);
      const medium = example.getByRole('textbox', { name: 'Medium prompt', exact: true });
      const small = example.getByRole('textbox', { name: 'Small prompt', exact: true });
      await expect.poll(async () => (await metrics(medium)).height).toBe(66);
      expect((await metrics(small)).height).toBe(58);
      await medium.focus();
      await medium.pressSequentially(lines(4));
      let measured = await metrics(medium);
      expect(measured.height).toBe(114);
      expect(measured.scrollHeight).toBeLessThanOrEqual(measured.clientHeight);
      expect(measured.inlineHeight).toBe(fallback ? '114px' : '');
      for (let count = 5; count <= 10; count++) {
        await medium.pressSequentially(`\nLine ${count}`);
        measured = await metrics(medium);
        expect(measured.height).toBe(count === 5 ? 138 : 162);
        expect(measured.inlineHeight).toBe(fallback ? `${count === 5 ? 138 : 162}px` : '');
      }
      expect(measured.scrollHeight).toBeGreaterThan(measured.clientHeight);
      expect(measured.scrollTop + measured.clientHeight).toBeGreaterThanOrEqual(measured.scrollHeight - 1);
      await medium.fill('one');
      await expect.poll(async () => (await metrics(medium)).height).toBe(66);
      await small.fill(lines(10));
      expect((await metrics(small)).height).toBe(138);
      await example.getByRole('button', { name: 'Load a long prompt' }).click();
      await expect(medium).toHaveValue(Array(20).fill('Respond clearly and include a helpful example.').join('\n'));
      await expect.poll(async () => (await metrics(medium)).height).toBe(162);
      expect((await metrics(small)).height).toBe(138);
      expect((await metrics(medium)).inlineHeight).toBe(fallback ? '162px' : '');
      const unbounded = page.getByRole('textbox', { name: 'Project description', exact: true });
      await expect(unbounded).toHaveClass(/field-sizing-content/);
      await expect(unbounded).toHaveClass(/min-h-\[88px\]/);
      if (!fallback) {
        const style = await unbounded.getAttribute('style');
        expect(style ?? '').not.toMatch(/height|--textarea-/);
      }
      await page.addScriptTag({ content: AXE });
      for (const scope of [example, unbounded.locator('xpath=ancestor::*[@data-component-preview]')]) {
        const violations = await scope.evaluate(async (element) => {
          // eslint-disable-next-line no-undef
          return (await axe.run(element)).violations.map((violation) => violation.id);
        });
        expect(violations).toEqual([]);
      }
    });
  }
}
