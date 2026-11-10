import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import SelectInvalid from './examples/SelectInvalid';
import SelectClearable from './examples/SelectClearable';
import ComboboxInvalid from '../Combobox/examples/ComboboxInvalid';
import SwitchValidation from '../Switch/examples/SwitchValidation';
import SliderInvalid from '../Slider/examples/SliderInvalid';

it('keeps the clearable Region select uniquely named alongside the invalid examples', () => {
  render(
    <>
      <SelectClearable />
      <SelectInvalid />
    </>,
  );
  expect(screen.getByRole('combobox', { name: 'Region' })).not.toHaveAttribute('aria-invalid');
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  describe(theme, () => {
    it.each([SelectInvalid, ComboboxInvalid, SwitchValidation, SliderInvalid])(
      '%s explains invalid states without axe violations',
      async (Example) => {
        document.documentElement.className = theme === 'light' ? '' : theme;
        render(<Example />);
        await expectNoAxeViolations();
      },
    );
  });
}
it.each([SelectInvalid, ComboboxInvalid, SwitchValidation, SliderInvalid])(
  '%s supports the Spanish catalog',
  async (Example) => {
    render(
      <I18nProvider locale="es">
        <Example />
      </I18nProvider>,
    );
    await expectNoAxeViolations();
  },
);
