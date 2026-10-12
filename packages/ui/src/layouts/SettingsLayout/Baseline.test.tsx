import { render } from '@testing-library/react';
import { SettingsLayout } from './SettingsLayout';

const groups = [{ label: 'Account', items: [{ id: 'profile', label: 'Profile' }] }];

it.each([
  ['omitted', undefined],
  ['empty-string', ''],
  ['empty-fragment', <></>],
  ['null', null],
] as const)('preserves fixture (c)/(d): saveBar %s DOM', async (name, saveBar) => {
  const { container } = render(
    <SettingsLayout groups={groups} title="Profile" saveBar={saveBar}>
      <p>Identity</p>
    </SettingsLayout>,
  );
  const ids = new Map<string, string>();
  const dom = container.innerHTML.replace(/_r_[a-z0-9]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `_r_${ids.size}_`);
    return ids.get(id)!;
  });
  await expect(dom).toMatchFileSnapshot(`./fixtures/${name}.html`);
});
