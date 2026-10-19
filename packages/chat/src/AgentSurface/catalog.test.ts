import { expect, it } from 'vitest';
import { defaultAgentCatalog } from './catalog';

it('the public Select validator returns only known option properties', () => {
  const validated = defaultAgentCatalog.Select!.validate({
    label: 'Choose',
    options: [{ value: 'en', label: 'English', className: 'agent-class', onClick: 'bad', extra: 'drop' }],
    unknown: 'drop',
  });
  expect(validated).toEqual({ label: 'Choose', options: [{ value: 'en', label: 'English' }] });
});
