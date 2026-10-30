import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('the repaired component pages have no accessibility baseline suppressions', () => {
  const baseline = JSON.parse(fs.readFileSync(new URL('../e2e/a11y-baseline.json', import.meta.url), 'utf8'));
  const repaired = /^(ChoiceCard|DiffViewer|Field|Textarea|ThemeProvider|Token|TokenInput|Toolbar)/;
  assert.deepEqual(
    Object.keys(baseline).filter((key) => repaired.test(key)),
    [],
  );
});
