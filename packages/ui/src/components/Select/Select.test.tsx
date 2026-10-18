import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldLabel } from '../Field/Field';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SimpleSelect } from './Select';
import SelectBasic from './examples/SelectBasic';
import SelectGrouped from './examples/SelectGrouped';
import SelectRich from './examples/SelectRich';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

function setup(onValueChange = vi.fn()) {
  const user = userEvent.setup();
  render(<SimpleSelect label="Fruit" items={fruits} onValueChange={onValueChange} />);
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  return { user, trigger, onValueChange };
}

const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

describe('Select', () => {
  it.each([{ 'aria-label': 'Available fruit' }, { 'aria-labelledby': 'list-label' }])(
    'respects an explicit SelectContent name %o',
    async (name) => {
      const user = userEvent.setup();
      render(
        <Select items={fruits}>
          <span id="list-label">Available fruit</span>
          <SelectLabel>Fruit</SelectLabel>
          <SelectTrigger placeholder="Choose a fruit" />
          <SelectContent {...name}>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
      const listbox = await screen.findByRole('listbox');
      expect(listbox).toHaveAccessibleName('Available fruit');
      for (const [attribute, value] of Object.entries(name)) {
        expect(listbox).toHaveAttribute(attribute, value);
      }
    },
  );

  it.each(['dark', 'light', 'high_contrast'])('reuses the exact caller aria-label in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    render(<SimpleSelect aria-label="Fruta" items={fruits} placeholder="Choose a fruit" />);
    const trigger = screen.getByRole('combobox', { name: 'Fruta' });
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAccessibleName('Fruta');
    expect(listbox).toHaveAttribute('aria-label', 'Fruta');
    expect(listbox).not.toHaveAttribute('aria-labelledby');
    await expectNoAxeViolations();
  });

  it.each(['dark', 'light', 'high_contrast'])('names the open listbox after the visible label in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    render(<SimpleSelect label="Fruit" items={fruits} defaultValue="apple" />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAccessibleName('Fruit');
    expect(listbox).toHaveAttribute('aria-labelledby', trigger.getAttribute('aria-labelledby'));
    await expectNoAxeViolations();
  });

  it.each(['dark', 'light', 'high_contrast'])('reuses a composed SelectLabel id in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    render(
      <Select items={fruits}>
        <SelectLabel>Fruit</SelectLabel>
        <SelectTrigger placeholder="Choose a fruit" />
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAccessibleName('Fruit');
    const labelId = screen.getByText('Fruit').id;
    expect(labelId).not.toBe('');
    expect(listbox).toHaveAttribute('aria-labelledby', labelId);
    expect(trigger).toHaveAttribute('aria-labelledby', labelId);
    expect(trigger).toHaveAttribute('aria-controls', listbox.id);
    await expectNoAxeViolations();
  });

  it('adds no fabricated name when the caller supplies no label', async () => {
    const user = userEvent.setup();
    render(<SimpleSelect items={fruits} placeholder="Choose a fruit" />);
    await user.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAccessibleName('');
    expect(listbox).not.toHaveAttribute('aria-label');
    expect(listbox).not.toHaveAttribute('aria-labelledby');
  });

  it('follows caller aria-label updates while open', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SimpleSelect aria-label="Fruit" items={fruits} />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(await screen.findByRole('listbox')).toHaveAccessibleName('Fruit');
    rerender(<SimpleSelect aria-label="Fruta" items={fruits} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveAccessibleName('Fruta'));
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Fruta');
  });

  it('reuses the label supplied by a surrounding Field', async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel id="field-label">Fruit</FieldLabel>
        <SimpleSelect items={fruits} />
      </Field>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAccessibleName('Fruit');
    expect(listbox).toHaveAttribute('aria-labelledby', 'field-label');
  });

  it('labels the trigger and shows the placeholder', () => {
    const { trigger } = setup();
    expect(trigger).toHaveTextContent('Select…');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])('opens with %s on the trigger', async (key) => {
    const { user, trigger } = setup();
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard(key);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('moves the highlight with ArrowDown / ArrowUp', async () => {
    const { user } = setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Apple'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Banana'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Apple'));
  });

  it('selects the highlighted option with Enter and closes', async () => {
    const { user, trigger, onValueChange } = setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Apple'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Banana'));
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Banana');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('highlights options by typeahead', async () => {
    const { user } = setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('c');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Cherry'));
  });

  it('marks the selected option and skips disabled ones', async () => {
    const user = userEvent.setup();
    render(<SelectBasic />);
    await user.click(screen.getByRole('combobox', { name: 'Deployment region' }));
    expect(await screen.findByRole('option', { name: 'EU West · Frankfurt' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'AP South · Singapore (soon)' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it.each([
    ['SelectBasic', SelectBasic, 'Deployment region'],
    ['SelectRich', SelectRich, 'Assign reviewer'],
    ['SelectGrouped', SelectGrouped, 'Instance size'],
  ] as const)('%s has no axe violations, closed and open', async (_n, Example, name) => {
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name }));
    await screen.findByRole('listbox');
    await expectNoAxeViolations();
  });
});

it('ref and triggerRef both reach the SimpleSelect trigger', () => {
  const ref = createRef<HTMLButtonElement>();
  const triggerRef = createRef<HTMLButtonElement>();
  render(<SimpleSelect ref={ref} triggerRef={triggerRef} items={fruits} aria-label="Fruit" />);
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  expect(ref.current).toBe(trigger);
  expect(triggerRef.current).toBe(trigger);
  ref.current?.focus();
  expect(trigger).toHaveFocus();
});
