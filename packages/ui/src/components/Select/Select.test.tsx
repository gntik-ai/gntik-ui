import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SimpleSelect } from './Select';
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
    expect(screen.getByRole('option', { name: 'AP South · Singapore (soon)' })).toHaveAttribute('aria-disabled', 'true');
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
