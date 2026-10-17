import { renderToStaticMarkup } from 'react-dom/server';
import TimePickerBasic from './examples/TimePickerBasic';

it('preserves the pre-extraction TimePicker example markup', async () => {
  await expect(renderToStaticMarkup(<TimePickerBasic />)).toMatchFileSnapshot('./fixtures/time-picker-basic.html');
});
