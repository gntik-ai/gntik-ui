import original from './outline-classes.json';
import { inputVariants as v0 } from '../components/Input/input.variants';
import { textareaVariants as v1 } from '../components/Textarea/textarea.variants';
import { numberInputVariants as v2 } from '../components/NumberInput/number-input.variants';
import { selectVariants as v3 } from '../components/Select/select.variants';
import { comboboxVariants as v4 } from '../components/Combobox/combobox.variants';
import { tokenInputVariants as v6 } from '../components/TokenInput/token-input.variants';
import { datePickerVariants as v7 } from '../components/DatePicker/date-picker.variants';
import { timePickerVariants as v8 } from '../components/TimePicker/time-picker.variants';
it('keeps every changed default slot byte-identical to the immutable base', () => {
  expect({
    'Input.root': v0().root(),
    'Textarea.root': v1(),
    'NumberInput.group': v2().group(),
    'Select.trigger': v3().trigger(),
    'Combobox.inputGroup': v4().inputGroup(),
    'Combobox.chipsGroup': v4().chipsGroup(),
    'TokenInput.root': v6().root(),
    'DatePicker.input': v7().input(),
    'TimePicker.root': v8().root(),
  }).toEqual(original);
});
