import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsIntegrationsPage from './Page';

describe('SettingsIntegrationsPage', () => {
  it('renders connectors, endpoints and deliveries', () => {
    render(<SettingsIntegrationsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Integrations' })).toBeInTheDocument();
    expect(screen.getByText('3 of 6 connected.')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Webhook endpoints' })).toBeInTheDocument();
    expect(within(screen.getByRole('table', { name: 'Webhook deliveries' })).getAllByRole('row')).toHaveLength(7);
  }, 15000);

  it('toggles a connector', async () => {
    const onConnectorChange = vi.fn();
    render(<SettingsIntegrationsPage onConnectorChange={onConnectorChange} />);
    const toggle = screen.getByRole('switch', { name: 'Issue tracker' });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(onConnectorChange).toHaveBeenCalledWith('issues', true);
    expect(screen.getByText('4 of 6 connected.')).toBeInTheDocument();
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsIntegrationsPage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
