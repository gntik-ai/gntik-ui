import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('ChartCard catalogue summary documents custom, controlled and toolbar-owned ranges', () => {
  const catalogue = readFileSync(new URL('../apps/docs/public/llms.txt', import.meta.url), 'utf8');
  const entry = catalogue.split('\n').find((line) => line.startsWith('- [Chart card]'));
  assert.ok(entry, 'ChartCard has a catalogue entry');
  for (const guidance of ['7d/30d/90d', 'custom ranges', 'range/onRangeChange', 'showRangeToggle={false}', 'toolbar', 'window as range']) {
    assert.ok(entry.includes(guidance), `ChartCard summary includes ${guidance}`);
  }
});
