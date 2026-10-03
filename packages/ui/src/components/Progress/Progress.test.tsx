import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Progress } from './Progress';
import ProgressBars from './examples/ProgressBars';

describe('Progress', () => {
  it('exposes a labelled progressbar with its value and a sized indicator', () => {
    render(<Progress label="Indexing" value={72} showValue />);
    const bar = screen.getByRole('progressbar', { name: 'Indexing' });
    expect(bar).toHaveAttribute('aria-valuenow', '72');
    expect(bar).toHaveTextContent('72%');
    const indicator = bar.querySelector('[class*="rounded-full"][style]');
    expect(indicator).toHaveStyle({ width: '72%' });
  });

  it('is indeterminate with value null and stops pulsing under reduced motion', () => {
    render(<Progress label="Waiting" value={null} />);
    const bar = screen.getByRole('progressbar', { name: 'Waiting' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-indeterminate');
    const indicator = bar.querySelector('[data-indeterminate].bg-primary');
    expect(indicator).toHaveClass('data-[indeterminate]:animate-pulse', 'motion-reduce:data-[indeterminate]:animate-none');
  });

  it('applies tone and size; accepts aria-label without a visible label', () => {
    render(<Progress aria-label="Upload" value={40} tone="destructive" size="lg" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar.querySelector('.bg-destructive')).toBeInTheDocument();
    expect(bar.querySelector('.h-2\\.5')).toBeInTheDocument();
  });

  it('updates aria-valuenow as the value changes', async () => {
    const user = userEvent.setup();
    render(<ProgressBars />);
    const bar = screen.getByRole('progressbar', { name: 'Rebuilding cache' });
    await user.click(screen.getByRole('button', { name: 'Advance' }));
    expect(bar).toHaveAttribute('aria-valuenow', '44');
  });

  it('example has no axe violations', async () => {
    render(<ProgressBars />);
    await expectNoAxeViolations();
  });
});
