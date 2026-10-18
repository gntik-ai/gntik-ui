import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n';
import { SimpleSelect } from './Select';

const items = [{ value: 'eu-west-1', label: 'EU West' }];
it.each(['button', '{Delete}', '{Backspace}'])(
  'clears SimpleSelect through %s and keeps its name and focus',
  async (action) => {
    const calls: unknown[] = [];
    render(
      <SimpleSelect
        clearable
        label="Region"
        items={items}
        defaultValue="eu-west-1"
        placeholder="Choose region"
        onValueChange={(v) => calls.push(v)}
        onClear={() => calls.push('clear')}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Region' });
    const button = screen.getByRole('button', { name: 'Clear Region' });
    expect(trigger.contains(button)).toBe(false);
    if (action === 'button') await userEvent.click(button);
    else {
      trigger.focus();
      await userEvent.keyboard(action);
    }
    expect(calls).toEqual([null, 'clear']);
    expect(trigger).toHaveTextContent('Choose region');
    expect(trigger).toHaveAccessibleName('Region');
    expect(trigger).toHaveFocus();
  },
);
it('does not clear on keys unless opted in', async () => {
  const change = vi.fn();
  render(<SimpleSelect label="Region" items={items} defaultValue="eu-west-1" onValueChange={change} />);
  screen.getByRole('combobox').focus();
  await userEvent.keyboard('{Delete}{Backspace}');
  expect(change).not.toHaveBeenCalled();
});
it('localizes the clear name and preserves the listbox name', async () => {
  render(
    <I18nProvider locale="es">
      <SimpleSelect clearable label="Region" items={items} defaultValue="eu-west-1" />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Borrar Region' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('combobox', { name: 'Region' }));
  expect(await screen.findByRole('listbox')).toHaveAccessibleName('Region');
});
it.each([{ disabled: true }, { readOnly: true }, { defaultValue: null }])(
  'hides SimpleSelect clear for %o',
  (props) => {
    render(<SimpleSelect clearable label="Region" items={items} defaultValue="eu-west-1" {...props} />);
    expect(screen.queryByRole('button', { name: 'Clear Region' })).not.toBeInTheDocument();
  },
);

it('supports Base UI cancellation through destructured event details', async () => {
  const onClear = vi.fn();
  render(
    <SimpleSelect
      clearable
      label="Region"
      items={items}
      defaultValue="eu-west-1"
      onValueChange={(_value, { cancel }) => cancel()}
      onClear={onClear}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Clear Region' }));
  expect(screen.getByRole('combobox')).toHaveTextContent('EU West');
  expect(onClear).not.toHaveBeenCalled();
});
