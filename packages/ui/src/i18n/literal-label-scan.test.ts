import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { findLiteralLabels, checkLabelBaseline, labelLiteralKey } from './literal-label-scan';

describe('literal label guard', () => {
  it('reports new accessible-name literals with their source file and line', () => {
    const literals = findLiteralLabels(
      '\n<button aria-label="Filters" title={"Filter items"} />',
      'packages/ui/src/components/Example.tsx',
    );
    expect(checkLabelBaseline(literals, [])).toEqual([
      'packages/ui/src/components/Example.tsx:2: hard-coded default aria-label: Filters',
      'packages/ui/src/components/Example.tsx:2: hard-coded default title: Filter items',
    ]);
  });
});

const root = resolve(__dirname, '../../../..');
const excluded = /(^|\/)(examples?|tests?|__tests__|stories|docs)(\/|$)|\.(test|spec|stories|doc)\./;
const sources = ['packages/ui/src/components', 'packages/ui/src/layouts', 'packages/blocks/src'].flatMap((dir) =>
  readdirSync(resolve(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => relative(root, resolve(entry.parentPath, entry.name)).split('\\').join('/'))
    .filter((file) => !excluded.test(file)),
);

it('component and block literals match the shrink-only baseline', () => {
  const literals = sources.sort().flatMap((file) => findLiteralLabels(readFileSync(resolve(root, file), 'utf8'), file));
  const baseline: string[] = JSON.parse(readFileSync(resolve(__dirname, 'literal-label-baseline.json'), 'utf8'));
  expect(checkLabelBaseline(literals, baseline)).toEqual([]);
});

it('asks for a fixed baseline entry to be removed', () => {
  expect(checkLabelBaseline([], ['packages/blocks/src/Example.tsx:aria-label:Filters'])).toEqual([
    'Remove fixed baseline entry: packages/blocks/src/Example.tsx:aria-label:Filters',
  ]);
});

it('rejects an extra occurrence of a baselined literal at its new line', () => {
  const literals = findLiteralLabels(
    '<nav aria-label="Billing cycle" />;\n<nav aria-label="Billing cycle" />;',
    'Example.tsx',
  );
  expect(checkLabelBaseline(literals, ['Example.tsx:aria-label:Billing cycle'])).toEqual([
    'Example.tsx:2: hard-coded default aria-label: Billing cycle',
  ]);
});

it('finds function defaults and multiline JSX, while allowing translations and explicit symbols', () => {
  const source = `const defaultLabels = { remove: (label: string) => \`Remove \${label}\` };
    const labels = { next: t('common.next') };
    <button
      aria-label={'Filters'}
      title="×" // i18n-literal-allow: non-translatable symbol
    />`;
  expect(findLiteralLabels(source, 'Example.tsx').map(labelLiteralKey)).toEqual([
    'Example.tsx:labels:`Remove ${label}`',
    'Example.tsx:aria-label:Filters',
  ]);
});

it('does not mistake property keys, format options or composed names for rendered literals', () => {
  const source = `const labels: Record<string, MessageKey> = { week: 'periodPicker.thisWeek' };
    <button aria-label={props['aria-label']} title={formatDate(value, { month: 'long' })} />;
    <button aria-label={\`\${label}: \${value}\`} />;`;
  expect(findLiteralLabels(source, 'Example.tsx')).toEqual([]);
});
