import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../Dialog';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { Autocomplete, type AutocompleteProps } from './Autocomplete';
import { doc } from './Autocomplete.doc';
import AutocompleteAsync from './examples/AutocompleteAsync';
import AutocompleteItems from './examples/AutocompleteItems';
import AutocompleteGrouped from './examples/AutocompleteGrouped';
import AutocompleteInline from './examples/AutocompleteInline';
import AutocompleteRegions from './examples/AutocompleteRegions';
import AutocompleteStates from './examples/AutocompleteStates';

const models = ['gpt-4o', 'gpt-4o-mini'];
const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];

const options = () => screen.queryAllByRole('option');
const highlighted = () => document.querySelector('[role="option"][data-highlighted]');
const statusText = () =>
  screen
    .queryAllByRole('status')
    .map((el) => el.textContent)
    .join(' ');

function Harness(props: Partial<AutocompleteProps<string>>) {
  return <Autocomplete<string> items={regions} label="Region" {...props} />;
}

const input = () => screen.getByRole<HTMLInputElement>('combobox', { name: 'Region' });

describe('Autocomplete free text', () => {
  it('keeps unlisted text on Tab and does not report an item selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onItemSelect = vi.fn();
    render(<Harness items={models} label="Model id" onValueChange={onValueChange} onItemSelect={onItemSelect} />);
    await user.type(screen.getByRole('combobox', { name: 'Model id' }), 'gpt-4o-mini-ft-acme');
    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Model id' })).toHaveValue('gpt-4o-mini-ft-acme');
    expect(onValueChange).toHaveBeenLastCalledWith('gpt-4o-mini-ft-acme');
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('keeps unlisted text on blur', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(
      <>
        <Harness items={models} label="Model id" onItemSelect={onItemSelect} />
        <button type="button">elsewhere</button>
      </>,
    );
    await user.type(screen.getByRole('combobox', { name: 'Model id' }), 'custom-ft');
    await user.click(screen.getByText('elsewhere'));
    expect(screen.getByRole('combobox', { name: 'Model id' })).toHaveValue('custom-ft');
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('works uncontrolled with defaultValue and controlled with value', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness defaultValue="eu" />);
    expect(input()).toHaveValue('eu');
    await user.type(input(), '-w');
    expect(input()).toHaveValue('eu-w');
    rerender(<Harness value="us-east-1" onValueChange={() => {}} />);
    expect(input()).toHaveValue('us-east-1');
  });
});

describe('Autocomplete picking', () => {
  it('filters, then ArrowDown + Enter fills the input, reports the item once, closes and keeps focus', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    const onValueChange = vi.fn();
    render(<Harness onItemSelect={onItemSelect} onValueChange={onValueChange} />);
    await user.type(input(), 'west');
    await waitFor(() => expect(options()).toHaveLength(2));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('us-west-2'));
    await user.keyboard('{Enter}');
    expect(input()).toHaveValue('us-west-2');
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith('us-west-2');
    expect(onValueChange).toHaveBeenLastCalledWith('us-west-2');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input()).toHaveFocus();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('a click picks once with the full item', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    const items = [
      { label: 'US West', id: 'w' },
      { label: 'EU West', id: 'e' },
    ];
    render(<Autocomplete items={items} label="Region" onItemSelect={onItemSelect} />);
    await user.type(screen.getByRole('combobox', { name: 'Region' }), 'eu');
    await user.click(await screen.findByRole('option', { name: 'EU West' }));
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith(items[1]);
    expect(screen.getByRole('combobox', { name: 'Region' })).toHaveValue('EU West');
  });

  it('press-drag-release onto an option picks exactly once', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(<Harness onItemSelect={onItemSelect} />);
    await user.type(input(), 'east');
    const option = await screen.findByRole('option', { name: 'us-east-1' });
    fireEvent.pointerDown(input(), { isPrimary: true, button: 0 });
    fireEvent.pointerEnter(option);
    fireEvent.pointerMove(option);
    fireEvent.mouseMove(option);
    fireEvent.mouseUp(option, { button: 0 });
    fireEvent.click(document.body);
    await waitFor(() => expect(input()).toHaveValue('us-east-1'));
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith('us-east-1');
  });

  it('uses itemToString and renderItem', async () => {
    const user = userEvent.setup();
    const items = [{ label: 'Frankfurt', code: 'eu-central-1' }];
    render(
      <Autocomplete
        items={items}
        label="Region"
        itemToString={(i) => i.code}
        renderItem={(i) => (
          <span>
            {i.label} <em>{i.code}</em>
          </span>
        )}
      />,
    );
    await user.type(screen.getByRole('combobox', { name: 'Region' }), 'central');
    await user.click(await screen.findByRole('option'));
    expect(screen.getByRole('combobox', { name: 'Region' })).toHaveValue('eu-central-1');
  });
});

describe('Autocomplete in a form', () => {
  function FormHarness({ onSubmit }: { onSubmit: (data: FormData) => void }) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <Autocomplete items={['db.internal', 'db.replica']} name="host" label="Host" />
        <button type="submit">Save</button>
      </form>
    );
  }

  it('Enter with the popup open and nothing highlighted submits the typed text once, unmodified', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FormHarness onSubmit={onSubmit} />);
    await user.type(screen.getByRole('combobox', { name: 'Host' }), ' db.int ');
    await screen.findByRole('listbox');
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0].get('host')).toBe(' db.int ');
  });

  it('Enter on a highlighted option fills the input and does not submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FormHarness onSubmit={onSubmit} />);
    await user.type(screen.getByRole('combobox', { name: 'Host' }), 'db.');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox', { name: 'Host' })).toHaveValue('db.internal');
  });
});

describe('Autocomplete Escape', () => {
  it('the first press closes the popup and keeps the text; a second press keeps it and stays silent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.type(input(), 'west');
    await screen.findByRole('listbox');
    onValueChange.mockClear();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input()).toHaveValue('west');
    await user.keyboard('{Escape}');
    expect(input()).toHaveValue('west');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('Escape on the closed popup still closes an enclosing Dialog, the first press does not', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <Harness />
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.type(await screen.findByRole('combobox', { name: 'Region' }), 'west');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(input()).toHaveValue('west');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Autocomplete Escape after a pick, inside a Dialog', () => {
  async function openDialog(user: ReturnType<typeof userEvent.setup>, props: Partial<AutocompleteProps<string>>) {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <Harness {...props} />
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.type(await screen.findByRole('combobox', { name: 'Region' }), 'west');
    await screen.findByRole('listbox');
  }

  const popupClosed = () => waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

  it('after a keyboard pick and the popup closing, one Escape closes the Dialog and changes nothing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onItemSelect = vi.fn();
    await openDialog(user, { onValueChange, onItemSelect });
    await user.keyboard('{ArrowDown}{Enter}');
    await popupClosed();
    expect(input()).toHaveValue('us-west-2');
    onValueChange.mockClear();
    onItemSelect.mockClear();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('after a pointer pick and the popup closing, one Escape closes the Dialog and changes nothing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onItemSelect = vi.fn();
    await openDialog(user, { onValueChange, onItemSelect });
    await user.click(await screen.findByRole('option', { name: 'us-west-2' }));
    await popupClosed();
    expect(input()).toHaveValue('us-west-2');
    onValueChange.mockClear();
    onItemSelect.mockClear();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('with the popup open, even after a pick and more typing, Escape closes only the popup and keeps the text', async () => {
    const user = userEvent.setup();
    await openDialog(user, {});
    await user.keyboard('{ArrowDown}{Enter}');
    await popupClosed();
    await user.type(input(), '-x');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await popupClosed();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(input()).toHaveValue('us-west-2-x');
  });
});

describe('Autocomplete groups', () => {
  const groups = [
    { label: 'Americas', items: ['us-east-1', 'us-west-2'] },
    { label: 'Europe', items: ['eu-west-1', 'eu-central-1'] },
  ];

  it('renders one named group per group and hides groups with no matches', async () => {
    const user = userEvent.setup();
    render(<Harness items={groups} />);
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    expect(within(list).getByRole('group', { name: 'Americas' })).toBeInTheDocument();
    expect(within(list).getAllByRole('group')).toHaveLength(2);
    await user.keyboard('{Escape}');
    await user.clear(input());
    await user.type(input(), 'central');
    await waitFor(() => expect(within(screen.getByRole('listbox')).getAllByRole('group')).toHaveLength(1));
    expect(screen.getByRole('group', { name: 'Europe' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Americas' })).not.toBeInTheDocument();
  });

  it('counts options across groups for the limit', async () => {
    const user = userEvent.setup();
    render(<Harness items={groups} limit={3} />);
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(options()).toHaveLength(3));
    expect(within(screen.getByRole('group', { name: 'Europe' })).getAllByRole('option')).toHaveLength(1);
    expect(statusText()).toContain('Showing 3 of 4. Keep typing to refine.');
  });

  it('picking from a group reports the item', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(<Harness items={groups} onItemSelect={onItemSelect} />);
    await user.type(input(), 'central');
    await user.click(await screen.findByRole('option', { name: 'eu-central-1' }));
    expect(onItemSelect).toHaveBeenCalledWith('eu-central-1');
  });
});

describe('Autocomplete limit', () => {
  const many = Array.from({ length: 20 }, (_, i) => `node-${String(i + 1).padStart(2, '0')}`);

  it('caps the options and shows the refine status with the real total', async () => {
    const user = userEvent.setup();
    render(<Harness items={many} limit={5} />);
    await user.type(input(), 'node');
    await waitFor(() => expect(options()).toHaveLength(5));
    expect(statusText()).toContain('Showing 5 of 20. Keep typing to refine.');
  });

  it('reads in Spanish', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <Harness items={many} limit={5} />
      </I18nProvider>,
    );
    await user.type(input(), 'node');
    await waitFor(() => expect(options()).toHaveLength(5));
    expect(statusText()).toContain('Mostrando 5 de 20. Sigue escribiendo para afinar.');
  });

  it('shows no refine status at or below the limit', async () => {
    const user = userEvent.setup();
    render(<Harness items={many} limit={5} />);
    await user.type(input(), 'node-0');
    await waitFor(() => expect(options()).toHaveLength(5));
    await user.type(input(), '1');
    await waitFor(() => expect(options()).toHaveLength(1));
    expect(statusText()).not.toContain('Keep typing');
    expect(statusText()).not.toContain('Showing');
  });
});

describe('Autocomplete inline completion (mode="both")', () => {
  const selection = () => [input().selectionStart, input().selectionEnd];

  it('completes the first prefix match as selected text and keeps the typed text as the value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness mode="both" onValueChange={onValueChange} />);
    await user.type(input(), 'us-w');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    expect(selection()).toEqual([4, 9]);
    expect(input()).toHaveAttribute('aria-autocomplete', 'both');
    expect(onValueChange).toHaveBeenLastCalledWith('us-w');
  });

  it('Backspace removes only the completion and does not re-complete', async () => {
    const user = userEvent.setup();
    render(<Harness mode="both" />);
    await user.type(input(), 'us-w');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    await user.keyboard('{Backspace}');
    expect(input()).toHaveValue('us-w');
    await waitFor(() => expect(selection()).toEqual([4, 4]));
    await user.keyboard('{Backspace}');
    expect(input()).toHaveValue('us-');
  });

  it('completes again on the next inserted character', async () => {
    const user = userEvent.setup();
    render(<Harness mode="both" />);
    await user.type(input(), 'us-w');
    await user.keyboard('{Backspace}');
    await user.keyboard('e');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    expect(selection()).toEqual([5, 9]);
  });

  it('Enter accepts the completion and reports the item once', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    const onValueChange = vi.fn();
    render(<Harness mode="both" onItemSelect={onItemSelect} onValueChange={onValueChange} />);
    await user.type(input(), 'us-w');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    await user.keyboard('{Enter}');
    expect(input()).toHaveValue('us-west-2');
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith('us-west-2');
    expect(onValueChange).toHaveBeenLastCalledWith('us-west-2');
    expect(input()).toHaveFocus();
  });

  it('Enter accepts a completion whose item is falsy', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(<Autocomplete<boolean> items={[false, true]} label="Flag" mode="both" onItemSelect={onItemSelect} />);
    const flag = screen.getByRole<HTMLInputElement>('combobox', { name: 'Flag' });
    await user.type(flag, 'f');
    await waitFor(() => expect(flag).toHaveValue('false'));
    await user.keyboard('{Enter}');
    expect(flag).toHaveValue('false');
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith(false);
  });

  it('Enter accepts a completion whose item is the number 0', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(
      <Autocomplete<number>
        items={[0, 1]}
        itemToString={(n) => (n === 0 ? 'zero' : 'one')}
        label="Count"
        mode="both"
        onItemSelect={onItemSelect}
      />,
    );
    const count = screen.getByRole<HTMLInputElement>('combobox', { name: 'Count' });
    await user.type(count, 'z');
    await waitFor(() => expect(count).toHaveValue('zero'));
    await user.keyboard('{Enter}');
    expect(count).toHaveValue('zero');
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith(0);
  });

  it('leaves text that is not a prefix untouched', async () => {
    const user = userEvent.setup();
    render(<Harness mode="both" />);
    await user.type(input(), 'west');
    await waitFor(() => expect(options()).toHaveLength(2));
    expect(input()).toHaveValue('west');
    expect(selection()).toEqual([4, 4]);
  });

  it('Tab drops the completion and keeps the typed text as value and form value', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onItemSelect = vi.fn();
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <Harness mode="both" name="region" onItemSelect={onItemSelect} />
        <button type="submit">Save</button>
      </form>,
    );
    await user.type(input(), 'us-w');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    await user.tab();
    expect(input()).toHaveValue('us-w');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit.mock.calls[0]?.[0].get('region')).toBe('us-w');
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('requestSubmit without blur submits the typed text, not the completion', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <Harness mode="both" name="region" />
      </form>,
    );
    await user.type(input(), 'us-w');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    input().form!.requestSubmit();
    expect(onSubmit.mock.calls[0]?.[0].get('region')).toBe('us-w');
  });

  it('blur drops the completion', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Harness mode="both" />
        <button type="button">elsewhere</button>
      </>,
    );
    await user.type(input(), 'us-w');
    await waitFor(() => expect(input()).toHaveValue('us-west-2'));
    await user.click(screen.getByText('elsewhere'));
    expect(input()).toHaveValue('us-w');
  });

  it('default mode is a list that never changes the text', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'us-w');
    await waitFor(() => expect(options()).toHaveLength(1));
    expect(input()).toHaveValue('us-w');
    expect(input()).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('keeps the typed text when a suggestion is highlighted and typing continues', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness mode="both" onValueChange={onValueChange} />);
    await user.type(input(), 'west');
    await user.keyboard('{ArrowDown}');
    expect(input()).toHaveValue('west');
    await user.keyboard('x');
    expect(input()).toHaveValue('westx');
    expect(onValueChange).toHaveBeenLastCalledWith('westx');
  });

  it('does not complete during IME composition', async () => {
    render(<Harness mode="both" />);
    fireEvent.compositionStart(input());
    fireEvent.change(input(), { target: { value: 'us-w' } });
    fireEvent.compositionEnd(input());
    await waitFor(() => expect(options()).toHaveLength(1));
    expect(input()).toHaveValue('us-w');
  });
});

describe('Autocomplete clearable', () => {
  it('is absent while empty, named Clear, and activating it empties the value and refocuses the input', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness clearable onValueChange={onValueChange} />);
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    await user.type(input(), 'eu');
    // While the popup is open Base UI aria-hides everything outside it, the clear button included.
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input()).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(input()).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('is named in Spanish', async () => {
    render(
      <I18nProvider locale="es">
        <Harness clearable defaultValue="eu" />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeInTheDocument();
  });
});

describe('Autocomplete in a Field', () => {
  it('is named and described by the field and is invalid', () => {
    render(
      <Field invalid>
        <FieldLabel>Model id</FieldLabel>
        <Autocomplete items={models} />
        <FieldDescription>Any model your provider serves</FieldDescription>
      </Field>,
    );
    const box = screen.getByRole('combobox', { name: 'Model id' });
    expect(box).toHaveAccessibleDescription('Any model your provider serves');
    expect(box).toHaveAttribute('aria-invalid', 'true');
  });

  it('a disabled Field disables the input and the clear button', () => {
    render(
      <Field disabled>
        <FieldLabel>Model id</FieldLabel>
        <Autocomplete items={models} clearable defaultValue="gpt" />
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Model id' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
  });

  it('a named Field submits the typed text once, not the inline completion', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <Field name="region">
          <FieldLabel>Region</FieldLabel>
          <Autocomplete items={regions} mode="both" />
        </Field>
        <button type="submit">Save</button>
      </form>,
    );
    const box = input();
    await user.type(box, 'us-w');
    await waitFor(() => expect(box).toHaveValue('us-west-2'));
    box.form!.requestSubmit();
    expect(box).not.toHaveAttribute('name');
    expect(onSubmit.mock.calls[0]?.[0].getAll('region')).toEqual(['us-w']);
  });

  it('the name prop inside a named Field still submits the typed text once', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <Field name="region">
          <FieldLabel>Region</FieldLabel>
          <Autocomplete items={regions} mode="both" name="region" />
        </Field>
      </form>,
    );
    const box = input();
    await user.type(box, 'us-w');
    await waitFor(() => expect(box).toHaveValue('us-west-2'));
    box.form!.requestSubmit();
    expect(box).not.toHaveAttribute('name');
    expect(onSubmit.mock.calls[0]?.[0].getAll('region')).toEqual(['us-w']);
  });

  it.each(['onChange', 'onBlur'] as const)(
    'Field validation (%s) sees the typed text, never the inline completion',
    async (validationMode) => {
      const user = userEvent.setup();
      const validate = vi.fn(() => null);
      render(
        <>
          <Field name="region" validationMode={validationMode} validate={validate}>
            <FieldLabel>Region</FieldLabel>
            <Autocomplete items={regions} mode="both" />
          </Field>
          <button type="button">elsewhere</button>
        </>,
      );
      const box = input();
      await user.type(box, 'us-w');
      await waitFor(() => expect(box).toHaveValue('us-west-2'));
      await user.click(screen.getByText('elsewhere'));
      await waitFor(() => expect(validate).toHaveBeenCalled());
      const seen = validate.mock.calls.map((call) => (call as unknown[])[0]);
      expect(seen).not.toContain('us-west-2');
      expect(seen[seen.length - 1]).toBe('us-w');
    },
  );

  it('dropping the name prop stops the field from serialising', () => {
    const read = (ui: ReactNode) => {
      const form = <form data-testid="form">{ui}</form>;
      return form;
    };
    const { rerender } = render(
      read(<Autocomplete items={regions} name="host" label="Region" defaultValue="db.int" />),
    );
    const data = () => new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect(data().getAll('host')).toEqual(['db.int']);
    rerender(read(<Autocomplete items={regions} label="Region" defaultValue="db.int" />));
    expect(data().getAll('host')).toEqual([]);
    expect(screen.getByTestId('form').querySelector('[name="host"]')).toBeNull();
  });

  it('dropping the name inside a named Field stops the field from serialising', () => {
    const tree = (name?: string) => (
      <form data-testid="form">
        <Field name={name}>
          <FieldLabel>Region</FieldLabel>
          <Autocomplete items={regions} defaultValue="db.int" />
        </Field>
      </form>
    );
    const { rerender } = render(tree('host'));
    const data = () => new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect(data().getAll('host')).toEqual(['db.int']);
    rerender(tree(undefined));
    expect(data().getAll('host')).toEqual([]);
    expect(screen.getByTestId('form').querySelector('[name="host"]')).toBeNull();
  });

  it('a disabled named Field submits nothing', () => {
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <Field name="region" disabled>
          <FieldLabel>Region</FieldLabel>
          <Autocomplete items={regions} defaultValue="us-w" />
        </Field>
      </form>,
    );
    input().form!.requestSubmit();
    expect(onSubmit.mock.calls[0]?.[0].getAll('region')).toEqual([]);
  });

  // vitest runs with css: false, so the compiled Tailwind rules are absent here. This stylesheet is test-authored and
  // keyed on the rendered state (the group that holds an aria-invalid input, or carries data-invalid), so it proves
  // the rendered element exposes that state to CSS. That the compiled CSS paints the border is proved in a real
  // browser by apps/docs/e2e/autocomplete.a11y.spec.js, which PR CI runs.
  const BORDER_VALID = 'rgb(0, 0, 255)';
  const BORDER_INVALID = 'rgb(255, 0, 0)';
  function withStateStylesheet() {
    const style = document.createElement('style');
    style.textContent = `
      [role="group"] { border: 1px solid ${BORDER_VALID}; }
      [role="group"][data-invalid], [role="group"]:has(input[aria-invalid="true"]) { border-color: ${BORDER_INVALID}; }`;
    document.head.append(style);
    return () => style.remove();
  }
  const groupOf = (box: HTMLElement) => box.closest<HTMLElement>('[role="group"]')!;

  it('standalone invalid sets aria-invalid and the rendered group reads as invalid, unlike a valid one', () => {
    const remove = withStateStylesheet();
    render(
      <>
        <Autocomplete<string> invalid items={regions} label="Bad" />
        <Autocomplete<string> items={regions} label="Good" />
      </>,
    );
    const bad = screen.getByRole('combobox', { name: 'Bad' });
    const good = screen.getByRole('combobox', { name: 'Good' });
    expect(bad).toHaveAttribute('aria-invalid', 'true');
    expect(getComputedStyle(groupOf(bad)).borderTopColor).toBe(BORDER_INVALID);
    expect(getComputedStyle(groupOf(good)).borderTopColor).toBe(BORDER_VALID);
    remove();
  });

  it('an invalid Field makes the rendered group read as invalid, unlike a valid Field', () => {
    const remove = withStateStylesheet();
    render(
      <>
        <Field invalid>
          <FieldLabel>Bad</FieldLabel>
          <Autocomplete<string> items={regions} />
        </Field>
        <Field>
          <FieldLabel>Good</FieldLabel>
          <Autocomplete<string> items={regions} />
        </Field>
      </>,
    );
    const bad = screen.getByRole('combobox', { name: 'Bad' });
    const good = screen.getByRole('combobox', { name: 'Good' });
    expect(getComputedStyle(groupOf(bad)).borderTopColor).toBe(BORDER_INVALID);
    expect(getComputedStyle(groupOf(good)).borderTopColor).toBe(BORDER_VALID);
    remove();
  });

  it('standalone disabled disables the input', () => {
    render(<Harness disabled />);
    expect(input()).toBeDisabled();
  });

  it('a placeholder and aria-label work without a visible label', () => {
    render(<Autocomplete items={regions} placeholder="Pick or type" aria-label="Region" />);
    expect(screen.getByRole('combobox', { name: 'Region' })).toHaveAttribute('placeholder', 'Pick or type');
  });
});

describe('Autocomplete empty state', () => {
  it('shows the catalog "No matches." when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'zzz');
    expect(await screen.findByText('No matches.')).toBeInTheDocument();
    expect(options()).toHaveLength(0);
  });
});

describe('Autocomplete keyboard contract', () => {
  const rows = doc.keyboard ?? [];
  it('documents each key row', () => {
    expect(rows.map(([key]) => key)).toEqual([
      'Type a character',
      'ArrowDown / ArrowUp',
      'Enter on a highlighted option',
      'Enter with nothing highlighted',
      'Escape',
      'Tab',
      'Enter (mode both)',
    ]);
  });

  it('Type a character: opens and filters', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'eu');
    await waitFor(() => expect(options()).toHaveLength(1));
    expect(input()).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowDown / ArrowUp: move the highlight', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), '-');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('us-east-1'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('us-west-2'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('us-east-1'));
  });

  it('Enter on a highlighted option: fills and closes', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'eu');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(input()).toHaveValue('eu-west-1');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('Escape: closes and keeps the text', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'eu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input()).toHaveValue('eu');
  });

  it('Tab: leaves with the typed text', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'eu');
    await user.tab();
    expect(input()).toHaveValue('eu');
    expect(input()).not.toHaveFocus();
  });
});

function Themed({ theme, children }: { theme: string; children: ReactNode }) {
  return (
    <div data-theme={theme} className={theme}>
      {children}
    </div>
  );
}

describe('Autocomplete live examples', () => {
  it('object items: itemToString fills the input, renderItem shapes the row, onItemSelect gets the item', async () => {
    const user = userEvent.setup();
    render(<AutocompleteItems />);
    await user.type(screen.getByRole('combobox', { name: 'Model' }), 'sma');
    const option = await screen.findByRole('option');
    expect(option).toHaveTextContent('model-smallSmall');
    await user.click(option);
    expect(screen.getByRole('combobox', { name: 'Model' })).toHaveValue('model-small');
    expect(screen.getByText('Picked a Small model.')).toBeInTheDocument();
  });

  it('object items: family labels and the picked message follow the locale', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <AutocompleteItems />
      </I18nProvider>,
    );
    await user.type(screen.getByRole('combobox', { name: 'Modelo' }), 'sma');
    const option = await screen.findByRole('option');
    expect(option).toHaveTextContent('model-smallPequeño');
    await user.click(option);
    expect(screen.getByText('Se eligió un modelo Pequeño.')).toBeInTheDocument();
  });

  it('async: the first request fails with a Retry row that succeeds and keeps the text', async () => {
    const user = userEvent.setup();
    render(<AutocompleteAsync />);
    const box = screen.getByRole('combobox', { name: 'Hostname' });
    await user.type(box, 'db');
    const retry = await screen.findByRole('option', { name: 'Retry' }, { timeout: 3000 });
    expect(screen.getByText('Couldn’t load options.')).toBeInTheDocument();
    await user.click(retry);
    expect(await screen.findByRole('option', { name: 'db.internal' }, { timeout: 3000 })).toBeInTheDocument();
    expect(box).toHaveValue('db');
  });
});

describe('Autocomplete a11y', () => {
  const examples = {
    regions: AutocompleteRegions,
    async: AutocompleteAsync,
    grouped: AutocompleteGrouped,
    inline: AutocompleteInline,
    states: AutocompleteStates,
    items: AutocompleteItems,
  };

  for (const theme of ['dark', 'light', 'high_contrast']) {
    for (const [name, Example] of Object.entries(examples)) {
      it(`${name} example has no axe violations in ${theme}`, async () => {
        const user = userEvent.setup();
        const { container } = render(
          <Themed theme={theme}>
            <Example />
          </Themed>,
        );
        await expectNoAxeViolations(container);
        await user.click(within(container).getAllByRole('combobox')[0]!);
        await user.keyboard('{ArrowDown}');
        await screen.findByRole('listbox');
        await expectNoAxeViolations(document.body);
      });
    }
  }

  it('the controlled example state round-trips', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <>
          <Harness value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.type(input(), 'ab');
    expect(screen.getByText('ab', { selector: 'output' })).toBeInTheDocument();
  });
});
