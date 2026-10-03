import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Cpu } from '@gntik-ai/icons';
import SettingsProfilePage from './Page';
import { SettingsFrame } from './SettingsFrame';
import { settingsNav, type SettingsNavExtraItem } from './settings-nav';

const extras: SettingsNavExtraItem[] = [
  { id: 'model-keys', label: 'Model keys', icon: Cpu },
  { id: 'labs', label: 'Labs', group: 'Product' },
];

describe('settingsNav', () => {
  it('keeps the nine pages and appends extra items to their group', () => {
    const groups = settingsNav('/settings', extras);
    expect(groups.map((g) => g.label)).toEqual(['Account', 'Workspace', 'Product']);
    const workspace = groups[1]!.items;
    expect(workspace.at(-1)).toEqual({ id: 'model-keys', label: 'Model keys', icon: Cpu, href: '/settings/model-keys' });
    expect(groups[2]!.items[0]!.href).toBe('/settings/labs');
    expect(settingsNav().flatMap((g) => g.items)).toHaveLength(9);
    expect(settingsNav(undefined, extras)[1]!.items.at(-1)!.href).toBeUndefined();
  });
});

describe('SettingsFrame', () => {
  it('renders a product page in the shared nav and reports navigation', { timeout: 15000 }, async () => {
    const onNavigate = vi.fn();
    render(
      <SettingsFrame page="model-keys" extraNavItems={extras} onNavigate={onNavigate} description="Bring your own provider keys.">
        <p>Keys table</p>
      </SettingsFrame>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Model keys' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Model keys/ })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: /^Labs/ }));
    expect(onNavigate).toHaveBeenCalledWith('labs');
  });

  it('built-in settings templates show the extra items too', { timeout: 15000 }, () => {
    render(<SettingsProfilePage extraNavItems={extras} />);
    expect(screen.getByRole('button', { name: /^Model keys/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
  });
});
