import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import SettingsProfilePage from './Page';
import { profileDOM } from './__tests__/dom';

it('fixture (b): explicit editable mode equals the unchanged fixture (a)', () => {
  const { container } = render(<SettingsProfilePage mode="editable" />);
  expect(profileDOM(container)).toEqual(readFileSync('src/settings-profile/fixtures/editable.snap', 'utf8'));
  expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
});

it('switches modes without breaking hook order', () => {
  const { container, rerender } = render(<SettingsProfilePage mode="editable" />);
  expect(screen.getByRole('textbox', { name: 'Full name' })).toBeInTheDocument();
  rerender(<SettingsProfilePage mode="read-only" />);
  expect(within(container.querySelector<HTMLElement>('#settings-content')!).queryAllByRole('textbox')).toHaveLength(0);
  rerender(<SettingsProfilePage mode="editable" />);
  expect(screen.getByRole('textbox', { name: 'Full name' })).toBeInTheDocument();
});
