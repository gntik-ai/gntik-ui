import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Slider } from './Slider';
import SliderRange from './examples/SliderRange';
import SliderSingle from './examples/SliderSingle';

function setup(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Slider label="Volume" showValue defaultValue={50} onValueChange={onValueChange} {...props} />);
  return { user, onValueChange, thumb: screen.getByRole('slider', { name: 'Volume' }) };
}

describe('Slider', () => {
  it('exposes role slider with its label and value', () => {
    const { thumb } = setup();
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    expect(thumb).toHaveAttribute('min', '0');
    expect(thumb).toHaveAttribute('max', '100');
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('ArrowRight / ArrowUp increase by one step', async () => {
    const { user, thumb } = setup({ step: 2 });
    await user.tab();
    expect(thumb).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '52');
    await user.keyboard('{ArrowUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '54');
  });

  it('ArrowLeft / ArrowDown decrease by one step', async () => {
    const { user, thumb, onValueChange } = setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(thumb).toHaveAttribute('aria-valuenow', '49');
    await user.keyboard('{ArrowDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '48');
    expect(onValueChange).toHaveBeenLastCalledWith(48, expect.anything());
  });

  it('PageUp / PageDown move by the large step', async () => {
    const { user, thumb } = setup({ largeStep: 10 });
    await user.tab();
    await user.keyboard('{PageUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{PageDown}{PageDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
  });

  it('Home / End jump to the minimum / maximum', async () => {
    const { user, thumb } = setup();
    await user.tab();
    await user.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
  });

  it('range: Tab moves between labelled thumbs that cannot cross', async () => {
    const user = userEvent.setup();
    render(<SliderRange />);
    const min = screen.getByRole('slider', { name: 'Minimum instances' });
    const max = screen.getByRole('slider', { name: 'Maximum instances' });
    await user.tab();
    expect(min).toHaveFocus();
    await user.keyboard('{End}');
    expect(min).toHaveAttribute('aria-valuenow', '7');
    await user.tab();
    expect(max).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(max).toHaveAttribute('aria-valuenow', '9');
  });

  it('ignores input while disabled', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Locked" defaultValue={10} disabled />);
    const thumb = screen.getByRole('slider', { name: 'Locked' });
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '10');
    expect(thumb).toBeDisabled();
  });

  it.each([
    ['SliderSingle', SliderSingle],
    ['SliderRange', SliderRange],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });
});
