import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PromptEditor, extractPromptVariables } from './PromptEditor';

const chips = () => within(screen.getByRole('list', { name: 'Detected variables' })).getAllByRole('listitem').map((li) => li.textContent);

describe('PromptEditor', () => {
  it('renders prompts, detected variables and parameters', async () => {
    render(<PromptEditor />);
    expect((screen.getByRole('textbox', { name: 'System prompt' }) as HTMLTextAreaElement).value).toContain('{{company}}');
    expect(chips()).toEqual(['company', 'language', 'ticket']);
    expect(screen.getByText('1 variable has no value')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveValue('0.7');
    expect(screen.getByRole('spinbutton', { name: 'Max tokens' })).toHaveValue(1024);
    await expectNoAxeViolations();
  });

  it('detects new variables and runs with the resolved input', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const onRun = vi.fn(() => new Promise<void>((r) => (finish = r)));
    render(<PromptEditor onRun={onRun} />);
    fireEvent.change(screen.getByRole('textbox', { name: /User prompt/ }), { target: { value: 'Reply to {{customer}} about {{ticket}}' } });
    expect(chips()).toEqual(['company', 'language', 'customer', 'ticket']);
    await user.type(screen.getByRole('textbox', { name: 'customer' }), 'Ada');
    await user.type(screen.getByRole('textbox', { name: 'ticket' }), 'Login fails');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledWith({
      system: expect.stringContaining('{{company}}'),
      user: 'Reply to {{customer}} about {{ticket}}',
      variables: { company: 'Northwind', language: 'English', customer: 'Ada', ticket: 'Login fails' },
      temperature: 0.7,
      maxTokens: 1024,
    });
    expect(screen.getByRole('button', { name: 'Running…' })).toHaveAttribute('aria-busy', 'true');
    await act(async () => finish());
    expect(screen.getByRole('button', { name: 'Run' })).toBeEnabled();
  });

  it('blocks Run on an empty user prompt or invalid max tokens', () => {
    render(<PromptEditor defaultUser="" />);
    expect(screen.getByRole('button', { name: 'Run' })).toBeDisabled();
    expect(extractPromptVariables('{{ a }} {{b.c}} {{a}}')).toEqual(['a', 'b.c']);
  });
});
