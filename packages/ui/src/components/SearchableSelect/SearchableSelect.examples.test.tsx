import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import SearchableSelectField from './examples/SearchableSelectField';
import SearchableSelectToolbar from './examples/SearchableSelectToolbar';
import SearchableSelectGrouped from './examples/SearchableSelectGrouped';
import SearchableSelectVirtualized from './examples/SearchableSelectVirtualized';
import SearchableSelectActions from './examples/SearchableSelectActions';
import ComboboxPopupSearch from '../Combobox/examples/ComboboxPopupSearch';
import WorkspaceSwitcherSearch from '../WorkspaceSwitcher/examples/WorkspaceSwitcherSearch';

const examples = [
  SearchableSelectField,
  SearchableSelectToolbar,
  SearchableSelectGrouped,
  SearchableSelectVirtualized,
  SearchableSelectActions,
  ComboboxPopupSearch,
  WorkspaceSwitcherSearch,
];

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const Example of examples) {
    it(`${Example.name} is axe-clean closed and open in ${theme}`, async () => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      render(<Example />);
      await expectNoAxeViolations();
      await user.click(screen.getAllByRole('combobox')[0]!);
      await screen.findByRole('listbox');
      await expectNoAxeViolations();
      await user.keyboard('{Escape}');
      cleanup();
    });
  }
}
