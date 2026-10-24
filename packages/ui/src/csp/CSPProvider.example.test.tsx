import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n';
import { expectNoAxeViolations } from '../test/a11y';
import CSPProviderPreview from './examples/CSPProviderPreview';

it.each(['en', 'es'])('the CSP preview is accessible and switches to static styles in %s', async (locale) => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale={locale}>
      <CSPProviderPreview />
    </I18nProvider>,
  );
  await expectNoAxeViolations();
  await user.click(
    screen.getByRole('button', { name: locale === 'es' ? 'Desactivar elementos de estilo' : 'Disable style elements' }),
  );
  expect(screen.getByRole('status')).toHaveTextContent(
    locale === 'es' ? 'Elementos de estilo desactivados' : 'Style elements disabled',
  );
  await user.click(screen.getByRole('combobox'));
  expect(screen.getByRole('listbox')).toHaveClass('[scrollbar-width:none]', '[&::-webkit-scrollbar]:hidden');
  await user.keyboard('{Escape}');
  await expectNoAxeViolations();
});
