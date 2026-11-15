import { render } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import DatePickerEditable from './examples/DatePickerEditable';
import DateRangePickerEditable from './examples/DateRangePickerEditable';

it.each(['dark', 'light', 'high_contrast'])('keeps editable examples axe clean in %s', async (theme) => {
  const { container } = render(
    <div className={theme}>
      <DatePickerEditable />
      <DateRangePickerEditable />
    </div>,
  );
  await expectNoAxeViolations(container);
});
