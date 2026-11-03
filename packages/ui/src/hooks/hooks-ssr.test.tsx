// @vitest-environment node
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import type { HookDoc } from '../doc';
import { I18nProvider } from '../i18n/I18nProvider';

const here = __dirname;
const docs = await Promise.all(
  readdirSync(here)
    .filter((file) => file.endsWith('.doc.ts'))
    .map(async (file) => ({
      base: file.replace(/\.doc\.ts$/, ''),
      doc: ((await import(`./${file}`)) as { doc: HookDoc }).doc,
    })),
);
const examples = await Promise.all(
  readdirSync(join(here, 'examples'))
    .filter((file) => file.endsWith('.tsx'))
    .map(async (file) => ({
      base: file.replace(/\.tsx$/, ''),
      Example: ((await import(`./examples/${file}`)) as { default: ComponentType }).default,
    })),
);

/** The visible text of server-rendered HTML. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/<!--.*?-->/g, '')
    .replace(/&#x27;/g, "'");

describe('hook examples on the server', () => {
  it('runs without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('has an example for every hook doc', () => {
    const withoutExample = docs.filter(({ base }) => !examples.some((e) => e.base.startsWith(`${base}Example`)));
    expect(withoutExample.map(({ doc }) => doc.name)).toEqual([]);
  });

  describe.each(docs)('$doc.name', ({ base, doc }) => {
    const own = examples.filter((e) => e.base.startsWith(`${base}Example`));

    it('renders every example with renderToString', () => {
      expect(own.length).toBeGreaterThan(0);
      for (const { Example } of own) expect(() => renderToString(<Example />)).not.toThrow();
    });

    it('prints each server value its doc names in backticks', () => {
      const values = [...doc.server.matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? '');
      expect(values.length, `${doc.name}: put the server values in backticks`).toBeGreaterThan(0);
      const printed = own.map(({ Example }) => textOf(renderToString(<Example />))).join('\n');
      for (const value of values) expect(printed, value).toContain(value);
    });
  });

  it('translates the labels shown inside the examples', () => {
    const fit = examples.find((e) => e.base === 'useFitCountExample')?.Example;
    if (!fit) throw new Error('useFitCountExample is missing');
    const html = renderToString(
      <I18nProvider locale="es">
        {(() => {
          const Fit = fit;
          return <Fit />;
        })()}
      </I18nProvider>,
    );
    const printed = textOf(html);
    expect(printed).toContain('Diseño');
    expect(printed).toContain('Accesibilidad');
    expect(printed).not.toContain('Accessibility');
  });
});
