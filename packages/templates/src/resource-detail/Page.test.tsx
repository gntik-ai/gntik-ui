import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { DEPLOYMENT_DETAILS, DEPLOYMENT_EVENTS } from '@gntik-ai/blocks';
import ResourceDetailPage from './Page';
import { detailActivity, detailDangerActions } from './data';

describe('ResourceDetailPage', () => {
  it('omits read-only history even when editable events are supplied', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceDetailPage readOnly name="Resource record" events={DEPLOYMENT_EVENTS} />);
    expect(screen.queryByRole('heading', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Status history' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('main')).queryByRole('definition')).not.toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('honors explicit read-only header props and the Edit handler', { timeout: 15000 }, async () => {
    const onAction = vi.fn();
    const onEditDetails = vi.fn();
    const { container } = render(
      <ResourceDetailPage
        readOnly
        name="Resource record"
        description="An explicit description."
        overviewDescription="Explicit detail copy."
        meta={[{ label: 'Identifier', value: 'record_42' }]}
        actions={[{ label: 'Inspect resource', onClick: onAction }]}
        onEditDetails={onEditDetails}
      />,
    );
    expect(screen.getByText('An explicit description.')).toBeInTheDocument();
    expect(screen.getByText('Explicit detail copy.')).toBeInTheDocument();
    expect(screen.getByText('record_42')).toBeInTheDocument();
    // Both responsive header action copies are visible to jsdom without layout CSS.
    await userEvent.click(screen.getAllByRole('button', { name: 'Inspect resource' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onEditDetails).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });

  it('ignores read-only history in the editable default', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceDetailPage history={[]} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('list', { name: 'Status history' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No status history' })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('models table detail without a history card or editable tabs', { timeout: 15000 }, async () => {
    const { default: TableDetail } = await import('./examples/postgres-table-detail');
    const { container } = render(<TableDetail />);
    expect(screen.getByRole('heading', { level: 1, name: 'Table detail' })).toBeInTheDocument();
    expect(screen.getByText('id, title, created_at')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it('models realtime configuration without a history card or editable tabs', { timeout: 15000 }, async () => {
    const { default: RealtimeConfiguration } = await import('./examples/realtime-configuration');
    const { container } = render(<RealtimeConfiguration />);
    expect(screen.getByRole('heading', { level: 1, name: 'Realtime configuration' })).toBeInTheDocument();
    expect(screen.getByText('workspace_42')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Status history' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it('models a runtime without a transition as explicit empty history', { timeout: 15000 }, async () => {
    const { default: RuntimeWithoutTransition } = await import('./examples/runtime-without-transition');
    const { container } = render(<RuntimeWithoutTransition />);
    expect(screen.getByRole('region', { name: 'Status history' })).toHaveTextContent('No status history');
    expect(within(screen.getByRole('main')).queryByRole('listitem')).not.toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('models a runtime transition with one event and no invented actor', { timeout: 15000 }, async () => {
    const { default: RuntimeWithTransition } = await import('./examples/runtime-with-transition');
    const { container } = render(<RuntimeWithTransition />);
    const list = screen.getByRole('list', { name: 'Status history' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText('Ready')).toBeInTheDocument();
    expect(list.querySelectorAll('time')).toHaveLength(1);
    expect(list.querySelector('time')).toHaveAttribute('datetime', '2026-05-01T10:00:00.000Z');
    expect(list).not.toHaveTextContent('by ');
    await expectNoAxeViolations(container);
  });

  it('shows every supplied read-only event without collapsing or adding actors', { timeout: 15000 }, async () => {
    const history = [
      { id: '1', status: 'Ready', tone: 'success' as const, title: 'Runtime ready', at: '2026-05-01T10:00:00Z' },
      { id: '2', status: 'Starting', tone: 'info' as const, title: 'Runtime starting', at: '2026-05-01T09:00:00Z' },
      {
        id: '3',
        status: 'Scheduled',
        tone: 'neutral' as const,
        title: 'Runtime scheduled',
        at: '2026-05-01T08:00:00Z',
      },
      { id: '4', status: 'Pending', tone: 'warning' as const, title: 'Runtime pending', at: '2026-05-01T07:00:00Z' },
      {
        id: '5',
        status: 'Requested',
        tone: 'neutral' as const,
        title: 'Runtime requested',
        at: '2026-05-01T06:00:00Z',
      },
    ];
    const { container } = render(<ResourceDetailPage readOnly name="Function runtime" history={history} />);
    const list = screen.getByRole('list', { name: 'Status history' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(list.querySelectorAll('time')).toHaveLength(5);
    expect(list).not.toHaveTextContent('by ');
    expect(screen.queryByRole('button', { name: /earlier/ })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('renders the named empty state for explicit empty read-only history', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceDetailPage readOnly name="Function runtime" history={[]} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Status history' })).toBeInTheDocument();
    const emptyTitle = screen.getByRole('heading', { name: 'No status history' });
    expect(emptyTitle.closest('[role="region"]')).toHaveAccessibleName('Status history');
    expect(screen.queryByRole('list', { name: 'Status history' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('main')).queryByRole('listitem')).not.toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
    for (const event of DEPLOYMENT_EVENTS) {
      expect(container).not.toHaveTextContent(event.title);
    }
    await expectNoAxeViolations(container);
  });

  it('uses only explicit resource data in read-only mode', { timeout: 15000 }, async () => {
    const { container } = render(
      <ResourceDetailPage
        readOnly
        name="Resource record"
        status="active"
        details={[{ id: 'identifier', label: 'Identifier', value: 'record_42' }]}
      />,
    );
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { level: 1, name: 'Resource record' })).toBeInTheDocument();
    expect(within(main).getByText('active')).toBeInTheDocument();
    expect(within(main).getByText('record_42')).toBeInTheDocument();
    const header = main.querySelector('header');
    expect(header).not.toBeNull();
    expect(header?.querySelector('dl')).toBeNull();
    expect(header?.querySelector('button')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    for (const text of [
      'orders-api',
      'eu-west-1',
      'View logs',
      'Redeploy',
      'Settings of this deployment.',
      'Settings of this resource.',
      'Public REST API for orders, carts and checkout.',
    ]) {
      expect(container).not.toHaveTextContent(text);
    }
    for (const item of DEPLOYMENT_DETAILS) {
      if (item.value) expect(container).not.toHaveTextContent(item.value);
    }
    for (const event of DEPLOYMENT_EVENTS) {
      for (const text of [event.status, event.title, event.description, event.actor]) {
        if (text) expect(main).not.toHaveTextContent(text);
      }
    }
    await expectNoAxeViolations(container);
  });

  it('keeps only Overview in read-only mode and ignores editable inputs', { timeout: 15000 }, async () => {
    const onTabChange = vi.fn();
    const onSaveSettings = vi.fn();
    const { container } = render(
      <ResourceDetailPage
        readOnly
        name="Function runtime"
        activity={detailActivity}
        dangerActions={detailDangerActions}
        onSaveSettings={onSaveSettings}
        defaultTab="settings"
        onTabChange={onTabChange}
      />,
    );
    const tablist = screen.getByRole('tablist', { name: 'Resource sections' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(1);
    const overview = within(tablist).getByRole('tab', { name: 'Overview' });
    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'Activity' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Danger zone' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Activity, newest first' })).not.toBeInTheDocument();
    screen.getByRole('main').focus();
    await userEvent.tab();
    expect(overview).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{Enter}{ArrowLeft}{Enter}{Home}{End}');
    expect(overview).toHaveFocus();
    expect(onTabChange).not.toHaveBeenCalledWith('activity');
    expect(onTabChange).not.toHaveBeenCalledWith('settings');
    expect(onSaveSettings).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it('renders the header with status and the overview tab', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceDetailPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'orders-api' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 2, name: 'Configuration' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Status history' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Status history' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches to Activity with the keyboard', { timeout: 15000 }, async () => {
    const onTabChange = vi.fn();
    render(<ResourceDetailPage onTabChange={onTabChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onTabChange).toHaveBeenCalledWith('activity');
    expect(screen.getByRole('region', { name: 'Activity, newest first' })).toBeInTheDocument();
  });

  it('saves the settings form and shows the danger zone', { timeout: 15000 }, async () => {
    const onSaveSettings = vi.fn();
    const { container } = render(<ResourceDetailPage defaultTab="settings" onSaveSettings={onSaveSettings} />);
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    const nameInput = screen.getByRole('textbox', { name: /Name/ });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'orders-api-v2');
    await userEvent.click(save);
    expect(onSaveSettings).toHaveBeenCalledWith(expect.objectContaining({ name: 'orders-api-v2' }));
    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('takes the Overview card copy from props', { timeout: 15000 }, () => {
    render(
      <ResourceDetailPage
        overviewTitle="Function settings"
        overviewDescription="Runtime and limits."
        historyTitle="Deploy history"
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Function settings' })).toBeInTheDocument();
    expect(screen.getByText('Runtime and limits.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Deploy history' })).toBeInTheDocument();
  });
});
