import { ThemeProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import SignInLarge from './SignInForm/examples/LargeFields';
import SignUpLarge from './SignUpForm/examples/LargeFields';
import ResetLarge from './ResetPasswordForm/examples/LargeFields';
import ForgotLarge from './ForgotPasswordForm/examples/LargeFields';
import MfaLarge from './MfaChallenge/examples/LargeFields';

for (const theme of ['dark', 'light', 'high_contrast'] as const) {
  it.each([
    ['sign-in', SignInLarge],
    ['sign-up', SignUpLarge],
    ['reset', ResetLarge],
    ['forgot', ForgotLarge],
    ['mfa', MfaLarge],
  ] as const)('%s large example is accessible in ' + theme, async (name, Example) => {
    const { container } = render(
      <ThemeProvider defaultMode={theme} storageKey={null}>
        <Example />
      </ThemeProvider>,
    );
    await expectNoAxeViolations(container);
    if (name === 'mfa') {
      await userEvent.click(screen.getByRole('button', { name: 'Use a backup code' }));
      await expectNoAxeViolations(container);
    }
  });
}
