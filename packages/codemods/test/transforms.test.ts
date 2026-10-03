import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { applyCodemods, codemods, getCodemod } from '../src/index.js';
import { rewriteChipText, tintedTones } from '../src/transforms/chip-text-aliases.js';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

describe.each(codemods.map((c) => c.meta.id))('%s', (id) => {
  const codemod = getCodemod(id)!;
  const dir = path.join(FIXTURES, id);
  const inputs = readdirSync(dir).filter((f) => /\.input\.\w+$/.test(f));

  it('has fixtures and complete meta', () => {
    expect(inputs.length).toBeGreaterThan(0);
    expect(codemod.meta).toMatchObject({ id, fromVersion: expect.any(String), toVersion: expect.any(String), description: expect.any(String) });
  });

  it.each(inputs)('%s', (input) => {
    const file = path.join(dir, input);
    const source = readFileSync(file, 'utf8');
    const outputFile = file.replace('.input.', '.output.');
    const reportsFile = file.replace(/\.input\.\w+$/, '.reports.json');
    const result = applyCodemods(source, file, [codemod]);
    const expected = existsSync(outputFile) ? readFileSync(outputFile, 'utf8') : source;
    expect(result.output).toBe(expected);
    expect(result.transforms).toEqual(expected === source ? [] : [id]);
    const reports = existsSync(reportsFile) ? (JSON.parse(readFileSync(reportsFile, 'utf8')) as object[]) : [];
    expect(result.reports).toHaveLength(reports.length);
    reports.forEach((r, i) => expect(result.reports[i]).toMatchObject(r));
    // Idempotent: a second run changes nothing.
    expect(applyCodemods(result.output, file, [codemod]).output).toBe(result.output);
  });

  if (codemod.meta.reportOnly) {
    it('never rewrites', () => {
      for (const input of inputs) expect(existsSync(path.join(dir, input.replace('.input.', '.output.')))).toBe(false);
    });
  }
});

describe('chip text helpers', () => {
  it('detects tinted tones with variants and rewrites only those', () => {
    expect([...tintedTones('hover:bg-primary/10 bg-success/14 bg-warning')]).toEqual(['primary', 'success']);
    expect(rewriteChipText('md:text-primary-text text-warning-text', new Set(['primary']))).toBe('md:text-primary-chip-text text-warning-text');
    expect(rewriteChipText('text-primary-texts', new Set(['primary']))).toBe('text-primary-texts');
  });
});
