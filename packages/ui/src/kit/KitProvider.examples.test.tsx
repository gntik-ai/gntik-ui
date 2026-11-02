import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { ThemeProvider, type ResolvedTheme } from '../theme/ThemeProvider';
import KitProviderBasic from './examples/KitProviderBasic';
import KitProviderScoped from './examples/KitProviderScoped';
import KitProviderPortals from './examples/KitProviderPortals';
import KitProviderConfiguration from './examples/KitProviderConfiguration';

it.each<ResolvedTheme>(['dark', 'light', 'high_contrast'])('examples and app dialogs pass axe in %s', async (theme) => {
  const user = userEvent.setup();
  render(
    <ThemeProvider forcedMode={theme} storageKey={null}>
      <KitProviderBasic />
      <KitProviderScoped />
      <KitProviderConfiguration />
      <KitProviderPortals />
    </ThemeProvider>,
  );
  await expectNoAxeViolations();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Saved')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Announce move' }));
  expect(document.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Moved');
  await user.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(await screen.findByRole('alertdialog')).toHaveTextContent('Delete project?');
  await expectNoAxeViolations();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('Cancelled')).toBeVisible();
});
