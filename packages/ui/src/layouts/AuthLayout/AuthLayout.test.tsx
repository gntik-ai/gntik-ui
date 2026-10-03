import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { musematicPreset } from '../../theme/presets';
import { AuthLayout } from './AuthLayout';
import AuthLayoutCard from './examples/AuthLayoutCard';
import AuthLayoutSplit from './examples/AuthLayoutSplit';

describe('AuthLayout', () => {
  it('split: brand panel is an aside named after the theme brand, after the form in the DOM', () => {
    render(
      <ThemeProvider brand={musematicPreset} storageKey={null}>
        <AuthLayout brand="Headline">
          <input aria-label="Email" />
        </AuthLayout>
      </ThemeProvider>,
    );
    const aside = screen.getByRole('complementary', { name: musematicPreset.name });
    const main = screen.getByRole('main');
    expect(aside).toHaveClass('hidden', 'lg:flex', 'lg:order-first');
    expect(main.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole('img', { name: musematicPreset.name })).toHaveLength(1);
  });

  it('card and full-bleed have no brand panel', () => {
    const { rerender, container } = render(<AuthLayout variant="card">form</AuthLayout>);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    rerender(<AuthLayout variant="full-bleed" fullScreen>form</AuthLayout>);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('bg-chrome', 'h-dvh');
  });

  it('skip link first, then the form fields in order', async () => {
    const user = userEvent.setup();
    render(<AuthLayoutSplit />);
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to sign-in form' });
    expect(skip).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveFocus();
  });

  it('the skip link moves focus to the form region', async () => {
    const user = userEvent.setup();
    render(<AuthLayoutCard />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('submitting the example announces progress', async () => {
    const user = userEvent.setup();
    render(<AuthLayoutSplit />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Signing you in…')).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    const { unmount } = render(<AuthLayoutSplit />);
    await expectNoAxeViolations();
    unmount();
    render(<AuthLayoutCard />);
    await expectNoAxeViolations();
  });
});
