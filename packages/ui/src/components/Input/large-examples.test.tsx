import { render } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import InputLargeAddons from './examples/InputLargeAddons';
import PasswordInputLarge from '../PasswordInput/examples/PasswordInputLarge';
import SecretFieldLarge from '../SecretField/examples/SecretFieldLarge';

it.each(['dark', 'light', 'high_contrast'] as const)('large control examples are accessible in %s', async (theme) => {
  const { container } = render(
    <ThemeProvider defaultMode={theme} storageKey={null}>
      <InputLargeAddons />
      <PasswordInputLarge />
      <SecretFieldLarge />
    </ThemeProvider>,
  );
  await expectNoAxeViolations(container);
});
