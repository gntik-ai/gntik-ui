import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../test/a11y';
import ScorecardPage from './Page';
import { attainment, periodDelta, scorecardMetrics } from './data';

describe('ScorecardPage', () => {
  it('renders KPIs, targets, radar and commentary', { timeout: 15000 }, async () => {
    render(<ScorecardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Quarterly scorecard' })).toBeInTheDocument();
    expect(screen.getByText('Compared with Q2 2026')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Metrics for Q3 2026 against target' });
    expect(within(table).getAllByRole('meter')).toHaveLength(scorecardMetrics.length);
    expect(screen.getByRole('complementary', { name: 'Commentary' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('switches period and posts a note', { timeout: 15000 }, async () => {
    const onPeriodChange = vi.fn();
    const onComment = vi.fn();
    render(<ScorecardPage defaultPeriod="Q2 2026" onPeriodChange={onPeriodChange} onComment={onComment} />);
    expect(screen.getByRole('table', { name: 'Metrics for Q2 2026 against target' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Period' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Q1 2026' }));
    expect(onPeriodChange).toHaveBeenCalledWith('Q1 2026');
    expect(screen.getByText('Compared with Q4 2025')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox'), 'Revenue on track.');
    await userEvent.click(screen.getByRole('button', { name: 'Post note' }));
    expect(onComment).toHaveBeenCalledWith('Revenue on track.');
  });

  it('flips sentiment for lower-is-better metrics', () => {
    const latency = scorecardMetrics.find((m) => m.id === 'latency')!;
    expect(periodDelta(latency, 176, 205)?.sentiment).toBe('positive');
    expect(attainment(latency, 180)).toBe(100);
  });

  it('renders commentary Markdown and safely handles untrusted bodies', { timeout: 15000 }, async () => {
    const { container } = render(
      <ScorecardPage
        comments={[
          {
            id: 'markdown',
            author: { name: 'Reviewer' },
            at: '2026-10-01T12:00:00Z',
            body: 'See [runbook](https://example.test/runbook). Use **retry** with `backoff`.\n\n<img src=x onerror=alert(1)>\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n```ts\nretry();\n```',
          },
        ]}
      />,
    );
    const thread = screen.getByRole('region', { name: 'Scorecard commentary' });
    expect(within(thread).getByRole('link', { name: /^runbook/ })).toHaveAttribute(
      'href',
      'https://example.test/runbook',
    );
    expect(within(thread).getByText('backoff').tagName).toBe('CODE');
    expect(within(thread).getByText('retry').tagName).toBe('STRONG');
    expect(within(thread).getByText('x')).toBeInTheDocument();
    expect(thread.querySelector('img, script, p p, a[href^="javascript:"]')).toBeNull();
    const user = userEvent.setup();
    await user.type(within(thread).getByRole('textbox'), 'Use **retry**');
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(within(thread).getAllByText('retry')).toHaveLength(2);
    expect(
      within(thread)
        .getAllByText('retry')
        .every((node) => node.tagName === 'STRONG'),
    ).toBe(true);
    await expectNoAxeViolations(container);
  });

  it.each(['dark', 'light', 'high_contrast'] as const)(
    'shows the sample Markdown and passes axe in %s',
    { timeout: 15000 },
    async (theme) => {
      const { container } = render(
        <ThemeProvider defaultMode={theme} storageKey={null}>
          <ScorecardPage />
        </ThemeProvider>,
      );
      const thread = screen.getByRole('region', { name: 'Scorecard commentary' });
      expect(within(thread).getByRole('link', { name: /^runbook/ })).toHaveAttribute(
        'href',
        'https://example.test/runbook',
      );
      expect(within(thread).getByText('backoff').tagName).toBe('CODE');
      await expectNoAxeViolations(container);
    },
  );
});
