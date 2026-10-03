import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import Status500Page from './Page';

describe('Status500Page', () => {
  it('renders the error page with the request id and landmarks', async () => {
    render(<Status500Page />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong on our side' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'The request failed' })).toBeInTheDocument();
    expect(screen.getByText('req_3b91e6c2f04d')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'System status' })).toHaveAttribute('href', '/status');
    await expectNoAxeViolations();
  });

  it('retries through onRetry', async () => {
    const onRetry = vi.fn(() => Promise.resolve());
    render(<Status500Page onRetry={onRetry} requestId="req_custom" />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText('req_custom')).toBeInTheDocument();
  });
});
