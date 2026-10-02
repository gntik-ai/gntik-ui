import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Toggle, ToggleGroup } from './ToggleGroup';
import ToggleGroupJoined from './examples/ToggleGroupJoined';
import ToggleGroupSegmented from './examples/ToggleGroupSegmented';
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
    ['ToggleGroupSegmented', ToggleGroupSegmented],
    ['ToggleGroupJoined', ToggleGroupJoined],
    ['ToggleMultiple', ToggleMultiple],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });
});
