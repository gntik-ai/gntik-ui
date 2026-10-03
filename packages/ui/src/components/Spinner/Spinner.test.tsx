import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is decorative without a label', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
  it('announces as status with a label', async () => {
    render(<Spinner label="Loading runs" />);
    expect(screen.getByRole('status', { name: 'Loading runs' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});
