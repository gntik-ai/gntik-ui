import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { ModelPicker, groupModels } from './ModelPicker';
import { DEMO_MODELS } from './fixtures';
import ModelPickerProviders from './examples/ModelPickerProviders';

function Controlled({ spy, compact }: { spy?: (id: string) => void; compact?: boolean }) {
  const [value, setValue] = useState<string | null>('swift');
  return (
    <ModelPicker
      compact={compact}
      models={DEMO_MODELS}
      value={value}
      onValueChange={(id) => {
        setValue(id);
        spy?.(id);
      }}
    />
  );
}

const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

describe('ModelPicker', () => {
  it('shows the selected model on a labelled trigger', () => {
    render(<Controlled />);
    const trigger = screen.getByRole('combobox', { name: 'Model' });
    expect(trigger).toHaveTextContent('Swift');
    expect(trigger).toHaveTextContent('Hosted');
  });

  it('compact trigger shows only the model name', () => {
    render(<Controlled compact />);
    const trigger = screen.getByRole('combobox', { name: 'Model' });
    expect(trigger).toHaveTextContent('Swift');
    expect(trigger).not.toHaveTextContent('Hosted');
  });

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])('opens with %s; groups by provider with capability badges', async (key) => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.tab();
    await user.keyboard(key);
    const listbox = await screen.findByRole('listbox');
    const groups = within(listbox).getAllByRole('group');
    expect(groups.map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent)).toEqual([
      'Hosted',
      'Self-hosted',
    ]);
    const balanced = screen.getByRole('option', { name: /Balanced/ });
    expect(balanced).toHaveTextContent('Vision');
    expect(balanced).toHaveTextContent('Tools');
    expect(balanced).toHaveTextContent('200K context');
    const deep = screen.getByRole('option', { name: /Deep reasoning/ });
    expect(deep).toHaveAttribute('aria-disabled', 'true');
    expect(deep).toHaveTextContent('Needs an upgraded plan');
  });

  it('ArrowDown / ArrowUp move; a disabled model is readable but Enter does not pick it; Enter selects and closes', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Controlled spy={spy} />);
    const trigger = screen.getByRole('combobox', { name: 'Model' });
    await user.click(trigger);
    await screen.findByRole('listbox');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Swift'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Balanced'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Deep reasoning'));
    await user.keyboard('{Enter}');
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Balanced'));
    await user.keyboard('{Enter}');
    expect(spy).toHaveBeenCalledWith('balanced');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Balanced');
  });

  it('typeahead jumps to a model by name', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('l');
    await waitFor(() => expect(highlighted()).toHaveTextContent('Local small'));
  });

  it('Escape closes without changing and returns focus', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Controlled spy={spy} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(spy).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it('groups in first-seen order', () => {
    expect(groupModels(DEMO_MODELS).map((g) => [g.provider, g.items.length])).toEqual([
      ['Hosted', 3],
      ['Self-hosted', 2],
    ]);
  });

  it('example has no axe violations, closed and open', async () => {
    const user = userEvent.setup();
    const { container } = render(<ModelPickerProviders />);
    await expectNoAxeViolations(container);
    await user.click(screen.getAllByRole('combobox')[0]!);
    await screen.findByRole('listbox');
    await expectNoAxeViolations(document.body);
  });
});
