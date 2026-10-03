import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { StatusDot } from './StatusDot';
import StatusDotInline from './examples/StatusDotInline';
import StatusDotTones from './examples/StatusDotTones';

describe('StatusDot', () => {
  it('renders the label next to a decorative dot with tone classes', () => {
    const { container } = render(<StatusDot tone="success" label="Operational" className="ml-1" />);
    expect(screen.getByText('Operational')).toBeInTheDocument();
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('ml-1');
    expect(root.querySelector('.bg-success')).toHaveAttribute('aria-hidden', 'true');
  });

  it('without a label, aria-label exposes it as an image', () => {
    render(<StatusDot tone="destructive" aria-label="Down" />);
    expect(screen.getByRole('img', { name: 'Down' })).toBeInTheDocument();
  });

  it('without any name the dot is hidden from assistive tech', () => {
    const { container } = render(<StatusDot />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('pulse renders a ping that is turned off under reduced motion', () => {
    const { container } = render(<StatusDot tone="primary" label="Deploying" pulse />);
    const ping = container.querySelector('[data-pulse]');
    expect(ping).toHaveClass('animate-ping', 'motion-reduce:animate-none');
  });

  it('examples have no axe violations', async () => {
    render(<><StatusDotTones /><StatusDotInline /></>);
    await expectNoAxeViolations();
  });
});
