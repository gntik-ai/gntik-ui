import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../src/args.js';
import { CliError } from '../src/errors.js';
import { cli } from './helpers.js';

describe('parseCliArgs', () => {
  it('parses a command, positionals and flags', () => {
    const a = parseCliArgs(['add', 'button', 'dialog', '--json', '--dry-run', '--no-install', '--cwd', 'app']);
    expect(a.command).toBe('add');
    expect(a.positionals).toEqual(['button', 'dialog']);
    expect(a.flags).toMatchObject({ json: true, dryRun: true, install: false, cwd: 'app', overwrite: false, deps: true });
  });

  it('accepts short flags and --limit', () => {
    const a = parseCliArgs(['search', 'dlg', '-k', 'component', '--limit', '3', '-r', 'x']);
    expect(a.flags).toMatchObject({ kind: 'component', limit: 3, registry: 'x' });
  });

  it('rejects unknown commands, unknown options and options of other commands', () => {
    expect(() => parseCliArgs(['frobnicate'])).toThrow(CliError);
    expect(() => parseCliArgs(['list', '--nope'])).toThrow(/Unknown option/);
    expect(() => parseCliArgs(['list', '--overwrite'])).toThrow(/not valid for "list"/);
    expect(() => parseCliArgs(['search', 'x', '--limit', '0'])).toThrow(/positive integer/);
  });
});

describe('run: version, help and usage errors', () => {
  it('prints the version', async () => {
    const r = await cli(['--version']);
    expect(r.code).toBe(0);
    expect(r.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
    expect((await cli(['--version', '--json'])).json).toMatchObject({ ok: true, command: 'version' });
  });

  it('prints help per command', async () => {
    const r = await cli(['add', '--help']);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('Usage: gntik-ui add');
    expect((await cli([])).code).toBe(2);
  });

  it('reports usage errors as JSON with exit code 2', async () => {
    const r = await cli(['list', '--overwrite', '--json']);
    expect(r.code).toBe(2);
    expect(r.json).toEqual({ ok: false, command: null, error: { code: 'USAGE', message: expect.any(String) } });
  });
});
