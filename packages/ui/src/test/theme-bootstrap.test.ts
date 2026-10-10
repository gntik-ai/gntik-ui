import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { themeScript } from '../theme/theme-script';

const require = createRequire(import.meta.url);

describe('published theme bootstrap', () => {
  it('resolves to a published classic script containing exactly the default themeScript()', () => {
    const file = require.resolve('@gntik-ai/ui/theme-bootstrap.js');
    expect(file).toMatch(/\/dist\/theme-bootstrap\.js$/);
    const { files } = JSON.parse(readFileSync(require.resolve('@gntik-ai/ui/package.json'), 'utf8')) as { files: string[] };
    expect(files).toContain('dist');
    const script = readFileSync(file, 'utf8').trim();
    expect(script).toBe(themeScript());
    expect(script.length).toBeLessThan(600);
    expect(script).not.toMatch(/\beval\s*\(|\bFunction\s*\(|document\.write|setAttribute\s*\(\s*['"]on|\bon\w+\s*=|createElement\s*\(\s*['"]script|\b(?:import|export)\b|use client/);
  });

  function run(script: string) {
    document.documentElement.className = 'consumer dark high_contrast';
    document.documentElement.style.colorScheme = '';
    window.eval(script);
    return { classes: document.documentElement.className, colorScheme: document.documentElement.style.colorScheme };
  }

  afterEach(() => vi.restoreAllMocks());

  it.each([
    { stored: 'dark', contrast: false, light: false, classes: 'consumer dark', colorScheme: 'dark' },
    { stored: 'light', contrast: false, light: false, classes: 'consumer', colorScheme: 'light' },
    { stored: 'high_contrast', contrast: false, light: false, classes: 'consumer high_contrast', colorScheme: 'dark' },
    { stored: null, contrast: true, light: true, classes: 'consumer dark', colorScheme: 'dark' },
    { stored: 'system', contrast: true, light: true, classes: 'consumer high_contrast', colorScheme: 'dark' },
    { stored: 'system', contrast: false, light: true, classes: 'consumer', colorScheme: 'light' },
    { stored: 'system', contrast: false, light: false, classes: 'consumer dark', colorScheme: 'dark' },
  ])('applies $stored with contrast=$contrast and light=$light exactly like the inline helper', ({ stored, contrast, light, classes, colorScheme }) => {
    if (stored !== null) localStorage.setItem('gntik-theme', stored);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-contrast: more)' ? contrast : light,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const external = run(readFileSync(require.resolve('@gntik-ai/ui/theme-bootstrap.js'), 'utf8'));
    expect(external).toEqual({ classes, colorScheme });
    expect(external).toEqual(run(themeScript()));
  });

  it('preserves the inline helper behavior when storage access throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage disabled'); });
    const external = run(readFileSync(require.resolve('@gntik-ai/ui/theme-bootstrap.js'), 'utf8'));
    expect(external).toEqual({ classes: 'consumer dark high_contrast', colorScheme: '' });
    expect(external).toEqual(run(themeScript()));
  });
});
