import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { StatusTag } from './StatusTag';
import StatusTagStates from './examples/StatusTagStates';

describe('StatusTag', () => {
  it('maps generic states to a label and tone', () => {
    render(<><StatusTag status="running" /><StatusTag status="failed" /></>);
    expect(screen.getByText('Running')).toHaveClass('text-success-text');
    expect(screen.getByText('Failed')).toHaveClass('text-destructive-text');
    expect(screen.getByText('Running')).toHaveAttribute('data-status', 'running');
  });

  it('uses the statuses dictionary prop before the defaults', () => {
    render(<StatusTag status="paused" statuses={{ paused: { label: 'On hold', tone: 'warning' } }} />);
    expect(screen.getByText('On hold')).toHaveClass('text-warning-text');
  });

  it('falls back to a neutral tag with the raw key for unknown states', () => {
    render(<StatusTag status="archived" />);
    expect(screen.getByText('archived')).toHaveClass('text-muted-foreground');
  });

  it('dot is decorative', () => {
    const { container } = render(<StatusTag status="queued" />);
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
  });

  it('example has no axe violations', async () => {
    render(<StatusTagStates />);
    await expectNoAxeViolations();
  });
});
