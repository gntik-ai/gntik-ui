import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import HomeDashboardPage from './Page';
import { meta } from './template.meta';

describe('HomeDashboardPage', () => {
  it('renders the shell, heading, KPIs, charts and activity', { timeout: 15000 }, async () => {
    const { container } = render(<HomeDashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByText('Active projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Infrastructure cost' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Requests' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Recent activity' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('reports quick actions by id', { timeout: 15000 }, async () => {
    const onQuickAction = vi.fn();
    render(<HomeDashboardPage onQuickAction={onQuickAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Invite members', description: /teammates/ }));
    expect(onQuickAction).toHaveBeenCalledWith('invite');
  });

  it('declares its meta', () => {
    expect(meta.priority).toBe('P1');
    expect(meta.blocks).toContain('kpi-row');
  });
});
