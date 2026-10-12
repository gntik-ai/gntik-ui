import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ChartCard } from './ChartCard';
import CustomRangeChartCard from './examples/custom-ranges';
import ToolbarOwnedRangeChartCard from './examples/toolbar-owned-range';

const ranges = [
  { value: '24h', label: '24h', summary: { value: '12 requests' } },
  { value: '7d', label: '7d', summary: { value: '70 requests' } },
  { value: '30d', label: '30d', summary: { value: '300 requests' } },
];
const dataByRange = {
  '24h': [{ time: 'Today', Requests: 12 }],
  '7d': [{ time: 'This week', Requests: 70 }],
  '30d': [{ time: 'This month', Requests: 300 }],
};
const custom = {
  title: 'Requests',
  ranges,
  dataByRange,
  index: 'time' as const,
  categories: ['Requests'] as const,
  dataTable: true,
  valueFormatter: (value: number) => String(value),
};

describe('ChartCard ranges', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('preserves the default options, initial selection and fixture data', () => {
    render(<ChartCard dataTable />);
    const buttons = within(screen.getByRole('group', { name: 'Infrastructure cost range' })).getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['7d', '30d', '90d']);
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('$2,412')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Infrastructure cost, 7d' })).toHaveTextContent('Mon$180$42$120');
  });

  it('renders the custom range example with the supplied windows', () => {
    render(<CustomRangeChartCard />);
    expect(
      within(screen.getByRole('group', { name: 'Requests range' }))
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['24h', '7d', '30d']);
    expect(screen.getByRole('figure', { name: 'Requests, 24h' })).toBeInTheDocument();
  });

  it('lets the toolbar example own the only range control', async () => {
    const user = userEvent.setup();
    render(<ToolbarOwnedRangeChartCard />);
    expect(screen.queryByRole('group', { name: 'Requests range', hidden: true })).toBeNull();
    expect(screen.queryByRole('button', { name: '90d' })).toBeNull();
    expect(screen.getByRole('figure', { name: 'Requests, 24h' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Page window' }));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual(['24h', '7d', '30d']);
    await user.click(await screen.findByRole('option', { name: '7d' }));
    expect(screen.getByRole('figure', { name: 'Requests, 7d' })).toBeInTheDocument();
    expect(screen.getByText('8,680 requests')).toBeInTheDocument();
  });

  it('renders exactly the supplied range options in order', () => {
    render(<ChartCard {...custom} />);
    const buttons = within(screen.getByRole('group', { name: 'Requests range' })).getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['24h', '7d', '30d']);
    expect(screen.queryByRole('button', { name: '90d' })).toBeNull();
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('holds controlled selection and data until the parent changes the range', async () => {
    const onRangeChange = vi.fn();
    const { rerender } = render(<ChartCard {...custom} range="7d" onRangeChange={onRangeChange} />);
    await userEvent.click(screen.getByRole('button', { name: '30d' }));
    expect(onRangeChange).toHaveBeenCalledExactlyOnceWith('30d');
    expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('figure', { name: 'Requests, 7d' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Requests, 7d' })).toHaveTextContent('This week70');
    expect(screen.queryByText('300 requests')).toBeNull();
    rerender(<ChartCard {...custom} range="30d" onRangeChange={onRangeChange} />);
    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('figure', { name: 'Requests, 30d' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Requests, 30d' })).toHaveTextContent('This month300');
    expect(screen.getByText('300 requests')).toBeInTheDocument();
  });

  it('updates uncontrolled selection and calls the consumer when clicked', async () => {
    const onRangeChange = vi.fn();
    render(<ChartCard {...custom} defaultRange="7d" onRangeChange={onRangeChange} />);
    await userEvent.click(screen.getByRole('button', { name: '30d' }));
    expect(onRangeChange).toHaveBeenCalledExactlyOnceWith('30d');
    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('table', { name: 'Requests, 30d' })).toHaveTextContent('This month300');
  });

  it('shows the controlled 24h data and label with the toggle hidden', () => {
    render(<ChartCard {...custom} range="24h" showRangeToggle={false} />);
    expect(screen.queryByRole('group', { name: 'Requests range', hidden: true })).toBeNull();
    expect(screen.getByRole('figure', { name: 'Requests, 24h' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Requests, 24h' })).toHaveTextContent('Today12');
    expect(screen.getByText('12 requests')).toBeInTheDocument();
  });

  it('uses one tab stop, arrow and boundary focus keys, and Space/Enter selection', async () => {
    const user = userEvent.setup();
    render(<ChartCard {...custom} defaultRange="7d" />);
    const group = screen.getByRole('group', { name: 'Requests range' });
    const [first, middle, last] = within(group).getAllByRole('button');
    const expectOneTabStop = () =>
      expect(
        within(group)
          .getAllByRole('button')
          .filter((b) => b.tabIndex === 0),
      ).toHaveLength(1);
    await user.tab();
    expect(middle).toHaveFocus();
    expectOneTabStop();
    await user.keyboard('{ArrowRight}');
    expect(last).toHaveFocus();
    expect(middle).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{ArrowLeft}');
    expect(middle).toHaveFocus();
    await user.keyboard('{Home}');
    expect(first).toHaveFocus();
    await user.keyboard(' ');
    expect(first).toHaveAttribute('aria-pressed', 'true');
    expect(middle).toHaveAttribute('aria-pressed', 'false');
    await user.keyboard('{End}');
    expect(last).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(last).toHaveAttribute('aria-pressed', 'true');
    expect(first).toHaveAttribute('aria-pressed', 'false');
    expectOneTabStop();
    await user.tab();
    expect(group).not.toContainElement(document.activeElement as HTMLElement);
  });

  it('keeps pointer focus on the clicked range for subsequent keyboard selection', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <ChartCard />
      </>,
    );
    const outside = screen.getByRole('button', { name: 'Outside' });
    const selected = screen.getByRole('button', { name: '90d' });
    await user.click(outside);
    await user.click(selected);
    expect(selected).toHaveFocus();
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(selected).toHaveFocus();
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(outside);
    await user.tab();
    expect(selected).toHaveFocus();
  });

  it('preserves an arrow-focused option when focus returns without Tab', async () => {
    const user = userEvent.setup();
    render(<ChartCard {...custom} defaultRange="7d" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    const focused = screen.getByRole('button', { name: '30d' });
    expect(focused).toHaveFocus();
    act(() => {
      focused.blur();
      focused.focus();
    });
    expect(focused).toHaveFocus();
    expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('returns keyboard focus to the selected range after a pointer release outside the group', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ChartCard showLegend={false} />
        <button type="button">Outside</button>
      </>,
    );
    const outside = screen.getByRole('button', { name: 'Outside' });
    const selected = screen.getByRole('button', { name: '7d' });
    const other = screen.getByRole('button', { name: '90d' });
    await user.pointer({ keys: '[MouseLeft>]', target: other });
    expect(other).toHaveFocus();
    await user.pointer({ keys: '[/MouseLeft]', target: outside });
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(outside).toHaveFocus();
    await user.tab({ shift: true });
    expect(selected).toHaveFocus();
    await user.keyboard(' ');
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(other).toHaveAttribute('aria-pressed', 'false');
  });

  it.each(['dark', 'light', 'high_contrast'])(
    'has no axe violations for default, custom and hidden ranges in %s',
    async (theme) => {
      const previousTheme = document.documentElement.className;
      document.documentElement.className = theme;
      try {
        for (const variant of [
          <ChartCard />,
          <ChartCard {...custom} />,
          <ChartCard {...custom} range="24h" showRangeToggle={false} />,
        ]) {
          const { container, unmount } = render(variant);
          await expectNoAxeViolations(container);
          unmount();
        }
      } finally {
        document.documentElement.className = previousTheme;
      }
    },
  );

  it.each(['range', 'defaultRange'] as const)(
    'falls back consistently for an unknown %s, warning only in development',
    (prop) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');
      const { unmount } = render(<ChartCard {...{ [prop]: 'unknown' }} />);
      expect(screen.getByRole('figure', { name: 'Infrastructure cost, 7d' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('$2,412')).toBeInTheDocument();
      expect(warning).toHaveBeenCalledWith(
        'ChartCard: range/defaultRange is not in ranges; falling back to the first option.',
      );
      unmount();
      warning.mockClear();
      vi.stubEnv('NODE_ENV', 'production');
      render(<ChartCard {...{ [prop]: 'unknown' }} />);
      expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
      expect(warning).not.toHaveBeenCalledWith(
        'ChartCard: range/defaultRange is not in ranges; falling back to the first option.',
      );
    },
  );

  it('omits the range control while preserving content and chart states', async () => {
    const onRetry = vi.fn();
    const props = {
      showRangeToggle: false,
      action: <button type="button">Details</button>,
      footer: 'Updated just now',
      onRetry,
    };
    const { rerender } = render(<ChartCard {...props} />);
    const expectNoRangeControl = () => {
      expect(screen.queryByRole('group', { name: 'Infrastructure cost range', hidden: true })).toBeNull();
      for (const name of ['7d', '30d', '90d']) {
        expect(screen.queryByRole('button', { name, hidden: true })).toBeNull();
      }
    };
    expectNoRangeControl();
    expect(screen.getByRole('heading', { name: 'Infrastructure cost' })).toBeInTheDocument();
    expect(screen.getByText('$2,412')).toBeInTheDocument();
    const figure = screen.getByRole('figure', { name: 'Infrastructure cost, 7d' });
    expect(within(figure).getByRole('button', { name: 'Compute' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('Updated just now')).toBeInTheDocument();
    rerender(<ChartCard {...props} state="loading" />);
    expectNoRangeControl();
    expect(screen.getByRole('status', { name: 'Loading chart' })).toBeInTheDocument();
    rerender(<ChartCard {...props} state="empty" emptyMessage="No samples yet" />);
    expectNoRangeControl();
    expect(screen.getByText('No samples yet')).toBeInTheDocument();
    rerender(<ChartCard {...props} state="error" errorMessage="Samples unavailable" />);
    expectNoRangeControl();
    expect(screen.getByRole('alert')).toHaveTextContent('Samples unavailable');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
