import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsProfilePage from './Page';

describe('SettingsProfilePage', () => {
  it('renders the settings frame with the profile page selected', () => {
    render(<SettingsProfilePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Profile/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Personal details' })).toBeInTheDocument();
  }, 15000);

  it('enables Save after an edit and saves the draft', async () => {
    const onSave = vi.fn();
    render(<SettingsProfilePage onSave={onSave} />);
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    const name = screen.getByLabelText('Full name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Avery Q. Collins');
    expect(save).toBeEnabled();
    await userEvent.click(save);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Avery Q. Collins' }));
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  }, 15000);

  it('reports section navigation', async () => {
    const onNavigate = vi.fn();
    render(<SettingsProfilePage onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('button', { name: /^Billing/ }));
    expect(onNavigate).toHaveBeenCalledWith('billing');
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsProfilePage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
