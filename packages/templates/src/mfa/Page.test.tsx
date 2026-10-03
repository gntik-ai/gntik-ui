import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import MfaChallengePage from './Page';

describe('MfaChallengePage', () => {
  it('renders the code step in a card', async () => {
    const { container } = render(<MfaChallengePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Enter your verification code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend code in 30s' })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it('auto-submits a complete code', async () => {
    const onVerify = vi.fn();
    render(<MfaChallengePage onVerify={onVerify} />);
    await userEvent.click(screen.getAllByRole('textbox')[0]!);
    await userEvent.keyboard('482913');
    expect(onVerify).toHaveBeenCalledWith('482913', 'code');
  });
});
