import { render } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import FirstPage from './examples/FirstPage';
import MiddlePage from './examples/MiddlePage';
import LastPage from './examples/LastPage';
import Busy from './examples/Busy';
import RowsPerPage from './examples/RowsPerPage';

for (const theme of ['dark', 'light', 'high_contrast']) {
  it.each([FirstPage, MiddlePage, LastPage, Busy, RowsPerPage])(
    `examples have no axe violations in ${theme}: %s`,
    async (Example) => {
      document.documentElement.className = theme;
      const { container } = render(<Example />);
      await expectNoAxeViolations(container);
    },
  );
}
