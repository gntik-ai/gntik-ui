import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from '../Select';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxSeparator,
} from './index';

it('uses the same group label and separator tokens as Select and merges caller classes', async () => {
  const select = render(
    <Select defaultOpen>
      <SelectTrigger aria-label="City" />
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Europe</SelectGroupLabel>
          <SelectItem value="Paris">Paris</SelectItem>
        </SelectGroup>
        <SelectSeparator data-testid="separator" />
      </SelectContent>
    </Select>,
  );
  const labelClasses = (await screen.findByText('Europe')).className;
  const separatorClasses = screen.getByTestId('separator').className;
  select.unmount();
  const combobox = render(
    <Combobox defaultOpen items={[{ value: 'Europe', items: ['Paris'] }]}>
      <ComboboxInput label="City" />
      <ComboboxContent>
        {(group: { value: string; items: string[] }) => (
          <ComboboxGroup key={group.value} items={group.items} className="py-1">
            <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
            <ComboboxCollection className="space-y-1">
              {(city: string) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              )}
            </ComboboxCollection>
            <ComboboxSeparator data-testid="separator" />
          </ComboboxGroup>
        )}
      </ComboboxContent>
    </Combobox>,
  );
  expect((await screen.findByText('Europe')).className).toBe(labelClasses);
  expect(screen.getByTestId('separator').className).toBe(separatorClasses);
  expect(screen.getByRole('group', { name: 'Europe' })).toHaveClass('py-1');
  expect(screen.getByRole('option', { name: 'Paris' }).parentElement).toHaveClass('space-y-1');
  combobox.unmount();
  render(
    <Combobox defaultOpen>
      <ComboboxInput label="City" />
      <ComboboxContent>
        <ComboboxGroup>
          <ComboboxGroupLabel className="px-5">Europe</ComboboxGroupLabel>
          <ComboboxItem value="Paris">Paris</ComboboxItem>
          <ComboboxSeparator data-testid="separator" className="my-2" />
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>,
  );
  expect(await screen.findByText('Europe')).toHaveClass('px-5');
  expect(screen.getByText('Europe')).not.toHaveClass('px-2.5');
  expect(screen.getByTestId('separator')).toHaveClass('my-2');
  expect(screen.getByTestId('separator')).not.toHaveClass('my-1');
});
