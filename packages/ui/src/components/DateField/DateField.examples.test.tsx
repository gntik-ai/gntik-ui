import { render } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import DateFieldBasic from './examples/DateFieldBasic';
import DateFieldTime from './examples/DateFieldTime';
import DateRangeFieldBasic from './examples/DateRangeFieldBasic';

for (const theme of ['dark', 'light', 'high_contrast']) {
  for (const Example of [DateFieldBasic, DateFieldTime, DateRangeFieldBasic]) {
    it(`${Example.name} has no axe violations in ${theme}`, async () => {
      document.documentElement.className = theme;
      render(<Example />);
      await expectNoAxeViolations();
    });
  }
}
