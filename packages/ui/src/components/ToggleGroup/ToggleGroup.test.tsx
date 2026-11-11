import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Toggle, ToggleGroup } from './ToggleGroup';
import ToggleGroupJoined from './examples/ToggleGroupJoined';
import ToggleGroupSegmented from './examples/ToggleGroupSegmented';
import { I18nProvider } from '../../i18n/I18nProvider';
import ToggleGroupChips from './examples/ToggleGroupChips';
import ToggleMultiple from './examples/ToggleMultiple';

function setup(multiple = false) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <>
      <button type="button">Before</button>
      <ToggleGroup aria-label="Alignment" multiple={multiple} defaultValue={['left']} onValueChange={onValueChange}>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="right">Right</Toggle>
      </ToggleGroup>
      <button type="button">After</button>
    </>,
  );
  const [left, center, right] = ['Left', 'Center', 'Right'].map((name) => screen.getByRole('button', { name }));
  return { user, onValueChange, left: left!, center: center!, right: right! };
}

describe('ToggleGroup', () => {
  it('renders a labelled group of aria-pressed buttons', () => {
    const { left, center } = setup();
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument();
    expect(left).toHaveAttribute('aria-pressed', 'true');
    expect(center).toHaveAttribute('aria-pressed', 'false');
  });

  it('ArrowRight / ArrowLeft move focus between items and wrap', async () => {
    const { user, left, center, right } = setup();
    left.focus();
    await user.keyboard('{ArrowRight}');
    expect(center).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(right).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(left).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(right).toHaveFocus();
    expect(left).toHaveAttribute('aria-pressed', 'true');
  });

  it('Home / End move focus to the first / last item', async () => {
    const { user, left, center, right } = setup();
    center.focus();
    await user.keyboard('{End}');
    expect(right).toHaveFocus();
    await user.keyboard('{Home}');
    expect(left).toHaveFocus();
  });

  it('Space / Enter toggle the focused item (single: one pressed at a time)', async () => {
    const { user, left, center, right, onValueChange } = setup();
    center.focus();
    await user.keyboard(' ');
    expect(center).toHaveAttribute('aria-pressed', 'true');
    expect(left).toHaveAttribute('aria-pressed', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith(['center'], expect.anything());
    await user.keyboard('{ArrowRight}{Enter}');
    expect(right).toHaveAttribute('aria-pressed', 'true');
    expect(center).toHaveAttribute('aria-pressed', 'false');
  });

  it('multiple: items toggle independently', async () => {
    const { user, left, center } = setup(true);
    await user.click(center);
    expect(left).toHaveAttribute('aria-pressed', 'true');
    expect(center).toHaveAttribute('aria-pressed', 'true');
    await user.click(left);
    expect(left).toHaveAttribute('aria-pressed', 'false');
  });

  it('Tab enters and leaves the group as a single stop', async () => {
    const { user, left } = setup();
    await user.tab();
    await user.tab();
    expect(left).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('segmented example keeps one item pressed and skips disabled items', async () => {
    const user = userEvent.setup();
    render(<ToggleGroupSegmented />);
    const all = screen.getByRole('button', { name: /^All/ });
    await user.click(all);
    expect(all).toHaveAttribute('aria-pressed', 'true');
    const disabled = screen.getByRole('button', { name: '90d' });
    await user.click(disabled);
    expect(disabled).toHaveAttribute('aria-pressed', 'false');
  });

  it('standalone Toggle flips aria-pressed with Space and Enter', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<Toggle aria-label="Pin" onPressedChange={onPressedChange} />);
    const t = screen.getByRole('button', { name: 'Pin' });
    await user.tab();
    await user.keyboard(' ');
    expect(t).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    expect(t).toHaveAttribute('aria-pressed', 'false');
    expect(onPressedChange).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['ToggleGroupChips', ToggleGroupChips],
    ['ToggleGroupSegmented', ToggleGroupSegmented],
    ['ToggleGroupJoined', ToggleGroupJoined],
    ['ToggleMultiple', ToggleMultiple],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });
});

describe('Toggle compatibility', () => {
  it.each(['segmented', 'joined'] as const)('%s keeps its markup and classes', (variant) => {
    const { container } = render(
      <ToggleGroup variant={variant} aria-label="Status" defaultValue={['failed']}>
        <Toggle value="all">All</Toggle>
        <Toggle value="failed">Failed</Toggle>
      </ToggleGroup>,
    );
    expect(container.innerHTML.replace(/id="[^"]*"/g, 'id="stable"')).toMatchSnapshot();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('standalone keeps its markup and classes without extra children', () => {
    const { container } = render(<Toggle defaultPressed>Failed</Toggle>);
    expect(container.innerHTML.replace(/id="[^"]*"/g, 'id="stable"')).toMatchSnapshot();
    const button = screen.getByRole('button', { name: 'Failed' });
    expect(button.childNodes).toHaveLength(1);
    expect(button.children).toHaveLength(0);
  });
});

describe('chip filters', () => {
  it.each(['standalone', 'segmented', 'joined', 'chip'] as const)(
    'includes the optional count in the %s button name',
    (variant) => {
      const toggle = (
        <Toggle value="failed" count={3}>
          Failed
        </Toggle>
      );
      render(
        variant === 'standalone' ? (
          toggle
        ) : (
          <ToggleGroup variant={variant} aria-label="Status">
            {toggle}
          </ToggleGroup>
        ),
      );
      const button = screen.getByRole('button', { name: 'Failed 3' });
      expect(button.lastElementChild).toHaveTextContent('3');
      expect(button.lastElementChild).toHaveClass('font-mono', 'tabular-nums', 'text-[11px]');
    },
  );

  it('renders a zero count', () => {
    render(<Toggle count={0}>Failed</Toggle>);
    expect(screen.getByRole('button', { name: 'Failed 0' }).lastElementChild).toHaveTextContent('0');
  });

  it('renders named filter buttons with a check only on the pressed chip', () => {
    render(
      <ToggleGroup variant="chip" aria-label="Status" multiple defaultValue={['failed']}>
        <Toggle value="all">All</Toggle>
        <Toggle value="running">Running</Toggle>
        <Toggle value="failed">Failed</Toggle>
      </ToggleGroup>,
    );
    const group = screen.getByRole('group', { name: 'Status' });
    expect(within(group).getAllByRole('button')).toHaveLength(3);
    expect(group).toHaveClass('flex-wrap', 'gap-1.5');
    for (const name of ['All', 'Running', 'Failed']) {
      const button = within(group).getByRole('button', { name });
      expect(button).toHaveClass('rounded-full', 'border', 'bg-card');
      expect(button).toHaveAttribute('aria-pressed', name === 'Failed' ? 'true' : 'false');
      expect(button.querySelectorAll('svg')).toHaveLength(name === 'Failed' ? 1 : 0);
      if (name === 'Failed') {
        expect(button.firstElementChild).toHaveAttribute('aria-hidden', 'true');
        expect(button.firstElementChild).toHaveAttribute('width', '14');
      }
    }
  });
});

describe('chip interaction', () => {
  function chips(value?: string[]) {
    return (
      <ToggleGroup
        variant="chip"
        aria-label="Status"
        multiple
        defaultValue={['failed']}
        value={value}
        onValueChange={onValueChange}
      >
        <Toggle value="all">All</Toggle>
        <Toggle value="running">Running</Toggle>
        <Toggle value="failed">Failed</Toggle>
      </ToggleGroup>
    );
  }
  const onValueChange = vi.fn();

  it('keeps roving focus, Home/End, wrapping arrows, Space/Enter and one Tab stop', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Before</button>
        {chips()}
        <button>After</button>
      </>,
    );
    const all = screen.getByRole('button', { name: 'All' });
    const running = screen.getByRole('button', { name: 'Running' });
    const failed = screen.getByRole('button', { name: 'Failed' });
    all.focus();
    await user.keyboard('{ArrowRight}');
    expect(running).toHaveFocus();
    await user.keyboard(' ');
    expect(running).toHaveAttribute('aria-pressed', 'true');
    expect(running.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1);
    expect(onValueChange).toHaveBeenLastCalledWith(['failed', 'running'], expect.anything());
    await user.keyboard('{End}');
    expect(failed).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(all).toHaveFocus();
    await user.keyboard('{End}{Home}');
    expect(all).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(all).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    expect(all.querySelector('svg')).toBeNull();
    screen.getByRole('button', { name: 'Before' }).focus();
    await user.tab();
    expect(screen.getByRole('group', { name: 'Status' })).toContainElement(document.activeElement as HTMLElement);
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('reflects controlled values without duplicating selection state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(chips(['failed']));
    const running = screen.getByRole('button', { name: 'Running' });
    await user.click(running);
    expect(running).toHaveAttribute('aria-pressed', 'false');
    expect(running.querySelector('svg')).toBeNull();
    rerender(chips(['running']));
    expect(running).toHaveAttribute('aria-pressed', 'true');
    expect(running.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Failed' }).querySelector('svg')).toBeNull();
  });

  it('shows counts in the single and multiple examples and translates their labels', () => {
    const { rerender } = render(<ToggleGroupChips />);
    expect(screen.getAllByRole('button', { name: 'Failed 3' })).toHaveLength(2);
    expect(screen.getByRole('group', { name: 'Status' })).toBeInTheDocument();
    rerender(
      <I18nProvider locale="es">
        <ToggleGroupChips />
      </I18nProvider>,
    );
    expect(screen.getAllByRole('button', { name: 'Fallidos 3' })).toHaveLength(2);
    expect(screen.getByRole('group', { name: 'Estado' })).toBeInTheDocument();
  });
});
