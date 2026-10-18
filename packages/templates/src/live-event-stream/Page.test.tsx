import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../test/a11y';
import LiveEventStreamPage from './Page';
import Connecting from './examples/Connecting';
import LiveEmpty from './examples/LiveEmpty';
import LiveWithEvents from './examples/LiveWithEvents';
import ErrorExample from './examples/Error';
import Stopped from './examples/Stopped';

const originalMatchMedia = window.matchMedia;
beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({ ...originalMatchMedia(query), matches: query.includes('min-width') }) as MediaQueryList;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

const events = [
  { id: 'a', timestamp: '12:00:00', type: 'created', summary: 'First record', payload: { name: 'alpha' } },
  { id: 'b', timestamp: '12:00:01', type: 'updated', summary: 'Second record', payload: { name: 'beta' } },
  { id: 'c', timestamp: '12:00:02', type: 'created', summary: 'Third record', payload: { name: 'gamma' } },
  { id: 'd', timestamp: '12:00:03', type: 'updated', summary: 'Fourth record', payload: { name: 'delta' } },
  { id: 'e', timestamp: '12:00:04', type: 'deleted', summary: 'Fifth record', payload: { name: 'epsilon' } },
];

describe('LiveEventStreamPage', () => {
  for (const theme of ['dark', 'light', 'high_contrast'] as const) {
    for (const [name, Example] of [
      ['connecting', Connecting],
      ['live-empty', LiveEmpty],
      ['live-with-events', LiveWithEvents],
      ['error', ErrorExample],
      ['stopped', Stopped],
      ['idle', LiveEventStreamPage],
    ] as const) {
      it(`${name} is axe-clean in ${theme}`, { timeout: 15000 }, async () => {
        render(
          <ThemeProvider defaultMode={theme} storageKey={null}>
            <Example />
          </ThemeProvider>,
        );
        if (name === 'live-with-events')
          await userEvent.click(screen.getAllByRole('button', { name: /^Inspect event/ })[0]!);
        await expectNoAxeViolations();
      });
    }
  }

  it('defaults to a 500-event buffer and supports an explicitly empty buffer', () => {
    const many = Array.from({ length: 502 }, (_, index) => ({
      id: String(index),
      timestamp: String(index),
      type: 'created',
      payload: null,
    }));
    const { rerender } = render(<LiveEventStreamPage status="live" events={many} />);
    expect(screen.getByText('500 of 502 events buffered')).toBeInTheDocument();
    expect(screen.getByText('500 of 500')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inspect event 501' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Inspect event 0' })).toBeNull();
    rerender(<LiveEventStreamPage status="live" events={many} maxEvents={0} />);
    expect(screen.getByText('0 of 502 events buffered')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Listening for events' })).toBeInTheDocument();
  });

  it('announces only a consumer-throttled count when one is explicitly provided', () => {
    const { rerender } = render(
      <LiveEventStreamPage status="live" events={events.slice(0, 1)} countAnnouncement="1 event received" />,
    );
    const announcement = screen.getByRole('status', { name: 'Connection status' });
    expect(announcement).toHaveTextContent('Live. 1 event received');
    rerender(<LiveEventStreamPage status="live" events={events} countAnnouncement="1 event received" />);
    expect(announcement).toHaveTextContent('Live. 1 event received');
    rerender(<LiveEventStreamPage status="live" events={events} countAnnouncement="5 events received" />);
    expect(announcement).toHaveTextContent('Live. 5 events received');
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
  });

  it('updates a pinned inspector and preserves its last payload when that event is evicted', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<LiveEventStreamPage status="live" events={events.slice(0, 2)} maxEvents={2} />);
    await user.click(screen.getByRole('button', { name: 'Inspect event 12:00:00' }));
    await user.click(screen.getByRole('button', { name: 'Pin panel' }));
    expect(screen.getByRole('button', { name: 'Pin panel' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Inspect event 12:00:01' }));
    const panel = screen.getByRole('complementary', { name: 'Event inspector' });
    expect(within(panel).getByRole('tree', { name: 'Event payload' })).toHaveTextContent('beta');
    rerender(<LiveEventStreamPage status="live" events={events} maxEvents={2} />);
    expect(within(panel).getByRole('tree', { name: 'Event payload' })).toHaveTextContent('beta');
    expect(within(panel).getByText('This event is no longer in the buffer.')).toBeInTheDocument();
    panel.focus();
    await user.keyboard('{Escape}');
    expect(panel).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close panel' }));
    expect(screen.queryByRole('complementary', { name: 'Event inspector' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Toggle event inspector' })).toHaveFocus();
  });

  it('closes an unpinned inspector with Escape and returns focus to its toggle', async () => {
    const user = userEvent.setup();
    render(<LiveEventStreamPage status="live" events={events.slice(0, 1)} />);
    await user.click(screen.getByRole('button', { name: 'Inspect event 12:00:00' }));
    const panel = screen.getByRole('complementary', { name: 'Event inspector' });
    panel.focus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('complementary', { name: 'Event inspector' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Toggle event inspector' })).toHaveFocus();
  });

  it('selects with a mouse or Tab and Enter and shows the selected payload', async () => {
    const user = userEvent.setup();
    const onSelectEvent = vi.fn();
    render(<LiveEventStreamPage status="live" events={events.slice(0, 2)} onSelectEvent={onSelectEvent} />);
    await user.click(screen.getByText('First record'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Inspect event 12:00:00' })).toHaveAttribute('aria-pressed', 'true'),
    );
    const panel = screen.getByRole('complementary', { name: 'Event inspector' });
    expect(within(panel).getByRole('tree', { name: 'Event payload' })).toHaveTextContent('alpha');
    expect(onSelectEvent).toHaveBeenLastCalledWith(events[0]);
    screen.getByRole('button', { name: 'Copy line 12:00:00' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Inspect event 12:00:01' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Inspect event 12:00:01' })).toHaveAttribute('aria-pressed', 'true'),
    );
    await waitFor(() => expect(within(panel).getByRole('tree', { name: 'Event payload' })).toHaveTextContent('beta'));
    expect(onSelectEvent).toHaveBeenLastCalledWith(events[1]);
    await expectNoAxeViolations();
  });

  it('filters buffered events by type and retains LogViewer search and copying', async () => {
    const user = userEvent.setup();
    render(
      <LiveEventStreamPage
        status="live"
        events={events}
        maxEvents={3}
        eventTypes={['created', 'updated', 'deleted']}
      />,
    );
    const types = screen.getByRole('group', { name: 'Event types' });
    await user.click(within(types).getByRole('button', { name: 'created' }));
    expect(screen.getByRole('log')).not.toHaveTextContent('Third record');
    expect(screen.getByRole('log')).toHaveTextContent('Fourth record');
    await user.type(screen.getByRole('searchbox', { name: 'Search logs' }), 'fourth');
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy line 12:00:03' }));
    expect(await navigator.clipboard.readText()).toBe('12:00:03 INFO [updated] Fourth record');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('keeps the newest bounded events in arrival order without announcing additions, including when stopped', () => {
    const { rerender } = render(<LiveEventStreamPage status="live" events={events.slice(0, 3)} maxEvents={3} />);
    const announcement = screen.getByRole('status', { name: 'Connection status' });
    expect(announcement).toHaveTextContent(/^Live$/);
    rerender(<LiveEventStreamPage status="live" events={events} maxEvents={3} />);
    const log = screen.getByRole('log', { name: 'Events' });
    expect(log).toHaveAttribute('aria-live', 'off');
    expect(announcement).toHaveTextContent(/^Live$/);
    expect(screen.getByText('3 of 5 events buffered')).toBeInTheDocument();
    expect(within(log).queryByText('First record')).toBeNull();
    expect(within(log).queryByText('Second record')).toBeNull();
    expect(
      within(log)
        .getAllByRole('button', { name: /^Copy line/ })
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Copy line 12:00:02', 'Copy line 12:00:03', 'Copy line 12:00:04']);
    rerender(<LiveEventStreamPage status="stopped" events={events} maxEvents={3} />);
    expect(screen.getByRole('log')).toHaveTextContent('Third record');
    expect(announcement).toHaveTextContent(/^Stopped$/);
  });

  it('shows idle and listening empty states, connecting skeletons, validation and stream errors', async () => {
    const { rerender } = render(<LiveEventStreamPage events={[]} />);
    expect(screen.getByRole('heading', { name: 'No events yet' })).toBeInTheDocument();
    rerender(<LiveEventStreamPage status="live" events={[]} />);
    expect(screen.getByRole('heading', { name: 'Listening for events' })).toBeInTheDocument();
    rerender(<LiveEventStreamPage status="connecting" events={[]} />);
    expect(screen.getByRole('region', { name: 'Events' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('log')).toBeNull();
    expect(
      within(screen.getByRole('region', { name: 'Events' })).getByRole('status', { hidden: true }),
    ).toHaveTextContent('Connecting');
    rerender(
      <LiveEventStreamPage status="error" error="Source is unavailable." validationMessage="Choose a source." />,
    );
    expect(screen.getByRole('alert', { name: 'Check subscription parameters' })).toHaveTextContent('Choose a source.');
    expect(screen.getByRole('alert', { name: 'Subscription error' })).toHaveTextContent('Source is unavailable.');
    await expectNoAxeViolations();
  });

  it('reflects controlled connection states and announces changes independently of event counts', async () => {
    const user = userEvent.setup();
    const onSubscribe = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(<LiveEventStreamPage onSubscribe={onSubscribe} onStop={onStop} />);
    const announcement = screen.getByRole('status', { name: 'Connection status' });
    for (const [status, label, tone, action, pulse] of [
      ['idle', 'Not subscribed', 'neutral', 'Subscribe', false],
      ['connecting', 'Connecting', 'info', 'Subscribe', true],
      ['live', 'Live', 'success', 'Stop', true],
      ['error', 'Error', 'destructive', 'Subscribe', false],
      ['stopped', 'Stopped', 'warning', 'Subscribe', false],
    ] as const) {
      rerender(<LiveEventStreamPage status={status} onSubscribe={onSubscribe} onStop={onStop} />);
      const indicator = screen.getByText(label, { selector: '[data-tone] > span' }).closest('[data-tone]')!;
      expect(indicator).toHaveAttribute('data-tone', tone);
      expect(Boolean(indicator.querySelector('[data-pulse]'))).toBe(pulse);
      if (pulse)
        expect(indicator.querySelector('[data-pulse]')).toHaveClass(
          'motion-reduce:hidden',
          'motion-reduce:animate-none',
        );
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveTextContent(label);
      const button = screen.getByRole('button', { name: action });
      if (status === 'connecting') {
        expect(button).toBeDisabled();
        await user.click(button);
        expect(onSubscribe).toHaveBeenCalledTimes(1);
      } else {
        expect(button).toBeEnabled();
        await user.click(button);
      }
    }
    expect(onSubscribe).toHaveBeenCalledTimes(3);
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('composes a subscription form, quiet log and complementary inspector without run telemetry', async () => {
    const user = userEvent.setup();
    render(<LiveEventStreamPage form={<p>Consumer subscription fields</p>} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Live event stream' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Subscription parameters' })).getByText('Consumer subscription fields'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
    expect(screen.getByText('Not subscribed', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: 'Events' })).toHaveAttribute('aria-live', 'off');
    expect(screen.queryByRole('timer')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Spans' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Tokens and cost' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Toggle event inspector' }));
    expect(screen.getByRole('complementary', { name: 'Event inspector' })).toHaveTextContent(
      'Select an event to inspect its payload.',
    );
    await expectNoAxeViolations();
  });
});
