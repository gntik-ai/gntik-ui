import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = decodeURIComponent(new URL('../../../tokens/src/', import.meta.url).pathname).replace(/^\/@fs/, '');
const css = ['brand.css', 'status.css', 'pairing.css', 'scope.css', 'palettes/navy.css']
  .map((file) => readFileSync(join(source, file), 'utf8'))
  .join('\n');
const frozen = JSON.parse(readFileSync(join(source, '../test/frozen-values.json'), 'utf8')) as Record<
  string,
  Record<string, string>
>;

describe('green CSS compatibility without @scope', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-palette');
  });

  it.each(['light', 'dark', 'high_contrast'])('preserves frozen %s tokens on the root and scopes', (theme) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
    // Model browsers that ignore unknown @scope rules, using the shipped CSS.
    const sheet = style.sheet!;
    for (let i = sheet.cssRules.length - 1; i >= 0; i--)
      if (sheet.cssRules[i]!.cssText.startsWith('@scope')) sheet.deleteRule(i);

    document.documentElement.className = theme === 'light' ? '' : theme;
    const scope = document.createElement('div');
    scope.className = theme;
    scope.dataset.palette = 'green';
    document.body.append(scope);
    const expected = theme === 'light' ? frozen[':root']! : frozen[`.${theme}`]!;
    for (const palette of [undefined, 'green']) {
      if (palette) document.documentElement.dataset.palette = palette;
      else document.documentElement.removeAttribute('data-palette');
      for (const element of [document.documentElement, scope]) {
        const computed = getComputedStyle(element);
        for (const [token, value] of Object.entries(expected)) {
          // Non-colour root tokens are inherited and outside jsdom's CSS support.
          if (theme === 'light' && !Object.hasOwn(frozen['.dark']!, token)) continue;
          expect(
            computed
              .getPropertyValue(token)
              .trim()
              .replace(/\s*\/\s*/g, '/'),
            `${theme} ${palette ?? 'default'} ${token}`,
          ).toBe(value.replace(/\s*\/\s*/g, '/'));
        }
      }
    }
  });
});
