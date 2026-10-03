import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { EnvironmentBadge } from './EnvironmentBadge';

describe('EnvironmentBadge', () => {
  it('renders the default environment and region', async () => {
    const { container } = render(<EnvironmentBadge />);
    const badge = container.querySelector('[data-environment]');
    expect(badge).toHaveAttribute('data-environment', 'production');
    expect(badge).toHaveTextContent(/production.*eu-west/);
    expect(screen.getByText('Environment:')).toHaveClass('sr-only');
    await expectNoAxeViolations(container);
  });

  it('picks the tone from the environment and accepts an override', () => {
    const { container, rerender } = render(<EnvironmentBadge environment="staging" region="us-east" />);
    expect(container.textContent).toContain('staging');
    rerender(<EnvironmentBadge environment="sandbox" region={null} tone="info" />);
    expect(container.textContent).not.toContain('·');
    expect(container.textContent).toContain('sandbox');
  });
});
