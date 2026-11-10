import { render } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import SelectInvalid from './examples/SelectInvalid';
import ComboboxInvalid from '../Combobox/examples/ComboboxInvalid';
import SwitchInvalid from '../Switch/examples/SwitchInvalid';
import SliderInvalid from '../Slider/examples/SliderInvalid';

for (const theme of ['dark', 'light', 'high_contrast']) {
  describe(theme, () => {
    it.each([SelectInvalid, ComboboxInvalid, SwitchInvalid, SliderInvalid])(
      '%s explains invalid states without axe violations',
      async (Example) => {
        document.documentElement.className = theme === 'light' ? '' : theme;
        render(<Example />);
        await expectNoAxeViolations();
      },
    );
  });
}
it.each([SelectInvalid, ComboboxInvalid, SwitchInvalid, SliderInvalid])(
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
