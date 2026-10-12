import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import SettingsProfilePage from './Page';
import { profileDOM } from './__tests__/dom';

it('preserves fixture (a): the default editable profile DOM', async () => {
  const { container } = render(<SettingsProfilePage />);
  await expect(profileDOM(container)).toMatchFileSnapshot('./fixtures/editable.snap');
});
