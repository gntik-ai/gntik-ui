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

  it('renders product charts from props', { timeout: 15000 }, () => {
    const signups = { '7d': [{ week: 'W1', Signups: 10, Trials: 4 }, { week: 'W2', Signups: 14, Trials: 6 }] };
    render(
      <HomeDashboardPage
        primaryChart={{ title: 'Signups', description: 'New accounts', ranges: [{ value: '7d', label: '7d' }], dataByRange: signups, index: 'week', categories: ['Signups', 'Trials'] }}
        secondaryChart={{ title: 'Agent runs', categories: ['Requests'] }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Signups' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Infrastructure cost' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Trials' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Agent runs' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Errors' })).toBeNull();
  });

  it('declares its meta', () => {
    expect(meta.priority).toBe('P1');
    expect(meta.blocks).toContain('kpi-row');
  });
});
