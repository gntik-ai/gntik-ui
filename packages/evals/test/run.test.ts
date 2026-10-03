import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { estimateCost } from '../src/cost.js';
import { credentialSource, main, parseArgs } from '../src/run.js';

describe('cli', () => {
  it('parses options', () => {
    expect(parseArgs(['--dry-run', '--only', 'members,billing', '--effort=xhigh', '--model', 'm', '--no-fallback'])).toMatchObject({
      dryRun: true,
      only: ['members', 'billing'],
      effort: 'xhigh',
      model: 'm',
      fallback: false,
      eager: true,
      maxTurns: 20,
    });
    expect(() => parseArgs(['--effort', 'huge'])).toThrow(/effort/);
    expect(() => parseArgs(['--bogus'])).toThrow(/unknown option/);
  });

  it('finds credentials the way the SDK resolves them', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'evals-home-'));
    expect(credentialSource({}, home)).toBeUndefined();
    expect(credentialSource({ ANTHROPIC_API_KEY: 'x' }, home)).toBe('ANTHROPIC_API_KEY');
    expect(credentialSource({ ANTHROPIC_AUTH_TOKEN: 'x' }, home)).toBe('ANTHROPIC_AUTH_TOKEN');
    fs.mkdirSync(path.join(home, '.config', 'anthropic'), { recursive: true });
    fs.writeFileSync(path.join(home, '.config', 'anthropic', 'config.toml'), '');
    expect(credentialSource({}, home)).toMatch(/profile/);
  });

  it('refuses a real run without --confirm-spend (no API call)', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await main(['--only', 'members'])).toBe(2);
    expect(err.mock.calls.flat().join('\n')).toMatch(/Refusing to run/);
    err.mockRestore();
  });

  it('dry run: replays the fixture end to end and writes results', async () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'evals-out-'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await main(['--dry-run', '--only', 'members,docs-article', '--out', out])).toBe(0);
    log.mockRestore();
    const summary = fs.readFileSync(path.join(out, 'summary.md'), 'utf8');
    expect(summary).toMatch(/\| members \| submitted \| \*\*100\*\*/);
    const rec = JSON.parse(fs.readFileSync(path.join(out, 'docs-article.json'), 'utf8')) as { outcome: string; transcript: { toolCalls: Array<{ isError: boolean }> }; usage: { requests: number } };
    expect(rec.outcome).toBe('submitted');
    expect(rec.transcript.toolCalls[0]?.isError).toBe(true);
    expect(rec.usage.requests).toBe(3);
    expect(fs.existsSync(path.join(out, 'members.tsx'))).toBe(true);
  }, 60_000);

  it('estimates cost at $4 / $20 / $0.20 per MTok', () => {
    const u = { requests: 1, inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 0 };
    expect(estimateCost(u, 'claude-opus-5-5')).toBeCloseTo(24.2);
  });
});
