import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../packages/ui/package.json', import.meta.url));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const examples = ['', '--grid', '--caption-start', '--under-hero', '--custom', '--empty'];

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const suffix of examples) {
    test(`logo-cloud${suffix} is accessible in ${theme}`, async ({ page }) => {
      await page.goto(`/preview.html?kind=block&id=logo-cloud${suffix}&theme=${theme}`);
      if (suffix !== '--empty') await expect(page.getByRole('list').first()).toBeVisible();
      else await expect(page.getByText('Loading…')).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: AXE });
      const violations = await page.locator('#root').evaluate(async (element) => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(element, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((violation) => violation.id);
      });
      expect(violations).toEqual([]);
      for (const [listIndex, list] of (await page.getByRole('list').all()).entries()) {
        for (const [itemIndex, image] of (await list.getByRole('img').all()).entries()) {
          const overridden = suffix === '--custom' && (listIndex === 0 || itemIndex === 0);
          const colours = await image.locator('svg').evaluate((svg, overridden) => {
            const probe = document.createElement('span');
            probe.className = overridden ? 'text-foreground' : 'text-muted-foreground';
            document.body.append(probe);
            const expected = getComputedStyle(probe).color;
            probe.remove();
            return { expected, fill: getComputedStyle(svg).fill };
          }, overridden);
          expect(colours.fill).toBe(colours.expected);
          expect((await image.locator('svg').boundingBox()).height).toBe(
            suffix === '--custom' && listIndex === 0 ? 40 : 28,
          );
        }
      }
    });
  }
}

for (const width of [320, 375]) {
  test(`row wraps without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/preview.html?kind=block&id=logo-cloud&theme=dark');
    await expect(page.getByRole('img')).toHaveCount(6);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);
    const boxes = await Promise.all((await page.getByRole('listitem').all()).map((item) => item.boundingBox()));
    expect(new Set(boxes.map((box) => box.y)).size).toBeGreaterThan(1);
  });
}

for (const width of [375, 1024]) {
  test(`grid columns and caption placement respond at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/preview.html?kind=block&id=logo-cloud--grid&theme=dark');
    await expect(page.getByRole('list')).toHaveCount(3);
    const lists = await page.getByRole('list').all();
    for (const [index, list] of lists.entries()) {
      const columns = await list.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(width < 768 ? 2 : [6, 3, 4][index]);
      const caption = await list.evaluate((element) => {
        const label = element.previousElementSibling.getBoundingClientRect();
        return { bottom: label.bottom, top: element.getBoundingClientRect().top };
      });
      expect(caption.bottom).toBeLessThanOrEqual(caption.top);
    }
    await page.goto('/preview.html?kind=block&id=logo-cloud--caption-start&theme=dark');
    const list = page.getByRole('list');
    await expect(list).toBeVisible();
    const boxes = await list.evaluate((element) => {
      const caption = element.previousElementSibling.getBoundingClientRect();
      const logos = element.getBoundingClientRect();
      return { captionBottom: caption.bottom, captionRight: caption.right, logosTop: logos.top, logosLeft: logos.left };
    });
    if (width < 768) expect(boxes.captionBottom).toBeLessThanOrEqual(boxes.logosTop);
    else expect(boxes.captionRight).toBeLessThanOrEqual(boxes.logosLeft);
  });
}

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`marks stay static with motion preference ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/preview.html?kind=block&id=logo-cloud&theme=dark');
    const list = page.getByRole('list');
    await expect(list).toBeVisible();
    const effects = await list.evaluate((element) =>
      [element.parentElement, ...element.parentElement.querySelectorAll('*')].map((node) => {
        const style = getComputedStyle(node);
        return {
          animation: style.animationName,
          filter: style.filter,
          mask: style.maskImage,
          transformTransition: style.transitionProperty.includes('transform') && style.transitionDuration !== '0s',
        };
      }),
    );
    for (const effect of effects) {
      expect(effect).toEqual({ animation: 'none', filter: 'none', mask: 'none', transformTransition: false });
    }
  });
}
