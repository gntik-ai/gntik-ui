import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const width of [375, 768, 1280]) {
    for (const fixture of ['full', 'minimal', 'loading', 'minimal-loading']) {
      test(`public-hub ${theme} / ${width} / ${fixture}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/preview.html?kind=template&id=public-hub--${fixture}&theme=${theme}`);
        const loading = fixture.includes('loading');
        const full = fixture === 'full' || fixture === 'loading';
        const region = page.getByRole('region', {
          name: loading ? 'Loading' : 'Welcome',
          exact: true,
        });
        await expect(region).toBeVisible();
        await page.evaluate(() => document.fonts.ready);

        // Check every text node, including wraps, rather than just a parent box.
        const textBoxes = await page.getByRole('main').evaluate((main) => {
          const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
          const boxes = [];
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(walker.currentNode);
            for (const rect of range.getClientRects()) {
              boxes.push({
                x: rect.x,
                y: rect.y,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
              });
            }
          }
          return boxes;
        });
        expect(textBoxes.length).toBeGreaterThan(0); // AuthLayout logo also remains during loading.
        for (const box of textBoxes) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
          expect(box.y).toBeGreaterThanOrEqual(0);
          expect(box.bottom).toBeLessThanOrEqual(900);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        expect(await page.getByRole('main').evaluate((main) => main.scrollWidth <= main.clientWidth)).toBe(true);
        expect(await region.evaluate((section) => section.scrollWidth <= section.clientWidth)).toBe(true);

        if (full) {
          const cards = region.getByRole('listitem');
          await expect(cards).toHaveCount(2);
          const first = await cards.nth(0).boundingBox();
          const second = await cards.nth(1).boundingBox();
          expect(first).not.toBeNull();
          expect(second).not.toBeNull();
          if (width === 375) {
            expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
            expect(second.x).toBeCloseTo(first.x, 0);
          } else {
            expect(second.y).toBeCloseTo(first.y, 0);
            expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
          }
        } else {
          await expect(region.getByRole('list')).toHaveCount(0);
        }

        if (loading) {
          await expect(region).toHaveAttribute('aria-busy', 'true');
          await expect(region.getByRole('heading')).toHaveCount(0);
          await expect(region.getByRole('link')).toHaveCount(0);
          await expect(region.getByRole('separator')).toHaveCount(0);
          expect(await region.locator('[aria-hidden="true"]').count()).toBeGreaterThan(0);
          return;
        }

        await expect(region.getByRole('heading', { level: 1 })).toHaveCount(1);
        const ordered = full
          ? [
              region.getByText('Start here', { exact: true }),
              region.getByRole('heading', { level: 1 }),
              region.getByText('Choose how to continue to your workspace.', {
                exact: true,
              }),
              region.getByRole('list'),
              region.getByRole('link', { name: 'Sign in', exact: true }),
              region.getByRole('link', {
                name: 'Create an account',
                exact: true,
              }),
              region.getByRole('link', { name: 'Recover access', exact: true }),
              region.getByRole('separator'),
              region.getByText('Need help? Contact your account administrator.', { exact: true }),
            ]
          : [region.getByRole('heading', { level: 1 }), region.getByRole('link', { name: 'Sign in', exact: true })];
        let previous;
        for (const element of ordered) {
          await expect(element).toBeVisible();
          const box = await element.boundingBox();
          expect(box).not.toBeNull();
          if (previous) expect(box.y).toBeGreaterThanOrEqual(previous.y + previous.height - 1);
          previous = box;
        }
        const domOrder = await region.evaluate((section) => {
          const elements = [...section.querySelectorAll('header h1, header p, ul, a, [role="separator"], :scope > p')];
          return elements.map((element) => element.getAttribute('role') === 'separator' ? 'separator' : element.tagName.toLowerCase());
        });
        expect(domOrder).toEqual(full ? ['h1', 'p', 'ul', 'a', 'a', 'a', 'separator', 'p'] : ['h1', 'a']);
        if (!full) {
          await expect(region.getByRole('separator')).toHaveCount(0);
          await expect(region.getByRole('link')).toHaveCount(1);
        }

        await page.keyboard.press('Tab'); // AuthLayout skip link comes before the template actions.
        await expect(page.getByRole('link', { name: 'Skip to main content', exact: true })).toBeFocused();
        for (const link of await region.getByRole('link').all()) {
          await page.keyboard.press('Tab');
          await expect(link).toBeFocused();
          await expect(link).toHaveAttribute('href', /.+/);
          const focus = await link.evaluate((element) => ({
            width: getComputedStyle(element).outlineWidth,
            style: getComputedStyle(element).outlineStyle,
          }));
          expect(parseFloat(focus.width)).toBeGreaterThan(0);
          expect(focus.style).not.toBe('none');
          const href = await link.getAttribute('href');
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(new RegExp(`${href}$`));
        }
        await page.keyboard.press('Tab');
        expect(await region.evaluate((section) => section.contains(document.activeElement))).toBe(false);
      });
    }
  }
}
