import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { AspectRatio } from './AspectRatio';
import AspectRatioMedia from './examples/AspectRatioMedia';

describe('AspectRatio', () => {
  it('locks the box to 16:9 by default and makes children fill it', () => {
    render(<AspectRatio data-testid="r"><img src="data:," alt="Preview" /></AspectRatio>);
    const r = screen.getByTestId('r');
    expect(r.style.aspectRatio).toBe(`${16 / 9} / 1`);
    expect(r).toHaveClass('relative', 'overflow-hidden', 'rounded-lg', '*:size-full');
  });

  it('takes a ratio, radius, surface and merges style / className', () => {
    render(<AspectRatio data-testid="r" ratio={4 / 3} radius="none" surface className="max-w-xs" style={{ opacity: 0.5 }} />);
    const r = screen.getByTestId('r');
    expect(r.style.aspectRatio).toBe(`${4 / 3} / 1`);
    expect(r.style.opacity).toBe('0.5');
    expect(r).toHaveClass('rounded-none', 'bg-secondary', 'border', 'max-w-xs');
  });

  it('renders through `render`', () => {
    render(<AspectRatio render={<figure />} ratio={1} aria-label="Avatar" />);
    expect(screen.getByRole('figure', { name: 'Avatar' }).style.aspectRatio).toBe('1 / 1');
  });

  it('example has no axe violations', async () => {
    render(<AspectRatioMedia />);
    await expectNoAxeViolations();
  });
});
