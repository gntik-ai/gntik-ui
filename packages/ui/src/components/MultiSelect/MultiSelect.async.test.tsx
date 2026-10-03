import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { MultiSelect, type MultiSelectOption } from './MultiSelect';
import MultiSelectAsync from './examples/MultiSelectAsync';

const ALL = ['Alpha', 'Beta', 'Gamma', 'Delta'].map((l) => ({ value: l.toLowerCase(), label: l }));
const search = async (q: string) => ALL.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
const highlighted = () => document.querySelector('[role="option"][data-highlighted]');
const statusText = () => screen.getAllByRole('status').map((el) => el.textContent).join(' ');

function Harness(props: Partial<Parameters<typeof MultiSelect>[0]>) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <MultiSelect label="Teams" options={[]} value={value} onValueChange={setValue} debounceMs={10} {...props} />
      <output>{value.join(',') || 'none'}</output>
    </>
  );
}

describe('MultiSelect async + creatable', () => {
  it('loads options for the query and keeps chips of earlier results', async () => {
    const load = vi.fn(search);
    const user = userEvent.setup();
    render(<Harness loadOptions={load} />);
    const input = screen.getByRole('combobox', { name: 'Teams' });
    await user.type(input, 'gam');
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Gamma']));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Gamma'));
    await user.keyboard('{Enter}');
    expect(screen.getByText('gamma', { selector: 'output' })).toBeInTheDocument();
    await user.type(input, 'bet');
    await waitFor(() => expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Beta']));
    expect(document.querySelector('output')).toHaveTextContent('gamma');
    // The chip stays although Gamma is no longer in the loaded options (Base UI hides it from AT while open).
    expect(screen.getByRole('button', { name: 'Remove Gamma', hidden: true })).toBeInTheDocument();
    expect(load).toHaveBeenLastCalledWith('bet', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('shows loading, then an error with a keyboard-reachable Retry', async () => {
    let fail = true;
    const load = vi.fn(async (q: string) => {
      await new Promise((r) => setTimeout(r, 20));
      if (fail) throw new Error('offline');
      return search(q);
    });
    const user = userEvent.setup();
    render(<Harness loadOptions={load} />);
    await user.click(screen.getByRole('combobox', { name: 'Teams' }));
    await waitFor(() => expect(statusText()).toContain('Loading…'));
    await waitFor(() => expect(statusText()).toContain('Couldn’t load options.'));
    fail = false;
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Retry'));
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(4));
    expect(screen.getByText('none', { selector: 'output' })).toBeInTheDocument();
  });

  it('creates an option from the typed text and selects it', async () => {
    const onCreate = vi.fn((input: string): MultiSelectOption => ({ value: `new-${input}`, label: input }));
    const user = userEvent.setup();
    render(<Harness options={ALL} onCreate={onCreate} />);
    await user.type(screen.getByRole('combobox', { name: 'Teams' }), 'Omega');
    expect(await screen.findByRole('option', { name: 'Create “Omega”' })).toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Create “Omega”'));
    await user.keyboard('{Enter}');
    expect(onCreate).toHaveBeenCalledWith('Omega');
    expect(await screen.findByRole('button', { name: 'Remove Omega', hidden: true })).toBeInTheDocument();
    expect(screen.getByText('new-Omega', { selector: 'output' })).toBeInTheDocument();
  });

  it('MultiSelectAsync has no axe violations, closed and open', async () => {
    const user = userEvent.setup();
    render(<MultiSelectAsync />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name: 'Topics' }));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(5), { timeout: 2000 });
    await expectNoAxeViolations();
  });
});
