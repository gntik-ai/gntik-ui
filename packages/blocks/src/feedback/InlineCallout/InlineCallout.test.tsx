import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { InlineCallout } from './InlineCallout';

describe('InlineCallout', () => {
  it('renders the default callout', async () => {
    const { container } = render(<InlineCallout />);
    expect(screen.getByRole('status', { name: /92% of your build minutes/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View usage' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('runs actions and dismisses', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(
      <InlineCallout tone="destructive" title="Sync failed" actions={[{ label: 'Retry', onClick: onRetry }]} dismissible onDismiss={onDismiss} />,
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
