import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Separator } from './Separator';
import SeparatorVariants from './examples/SeparatorVariants';

describe('Separator', () => {
  it('exposes role separator with its orientation', () => {
    render(<><Separator /><Separator orientation="vertical" /></>);
    const [h, v] = screen.getAllByRole('separator');
    expect(h).toHaveClass('h-px', 'bg-border');
    expect(v).toHaveAttribute('aria-orientation', 'vertical');
    expect(v).toHaveClass('w-px');
  });

  it('renders one separator role around a label, in any position', () => {
    const { rerender } = render(<Separator label="Members" />);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
    expect(screen.getByText('Members')).toBeInTheDocument();
    rerender(<Separator label="Members" labelPosition="start" labelStyle="kicker" />);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
    expect(screen.getByText('Members')).toHaveClass('uppercase');
    rerender(<Separator label="Members" labelPosition="end" />);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('strong variant is thicker', () => {
    render(<Separator variant="strong" />);
    expect(screen.getByRole('separator')).toHaveClass('h-0.5');
  });

  it('example has no axe violations', async () => {
    render(<SeparatorVariants />);
    await expectNoAxeViolations();
  });
});
