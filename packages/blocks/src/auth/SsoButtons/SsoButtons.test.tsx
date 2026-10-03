import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SsoButtons } from './SsoButtons';

describe('SsoButtons', () => {
  it('renders the default providers in a named group', async () => {
    const { container } = render(<SsoButtons />);
    expect(screen.getByRole('group', { name: 'Single sign-on' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with SSO' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('reports the chosen provider and shows its loading state', async () => {
    const onSelect = vi.fn();
    const { rerender } = render(<SsoButtons onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(onSelect).toHaveBeenCalledWith('google');
    rerender(<SsoButtons onSelect={onSelect} loadingId="google" />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Continue with SSO' })).toBeDisabled();
  });
});
