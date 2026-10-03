import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import ControlledVariables from './examples/controlled-variables';
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

  it('supports controlled variables', async () => {
    const user = userEvent.setup();
    const onVariablesChange = vi.fn();
    const onRun = vi.fn();
    const { rerender } = render(
      <PromptEditor variables={{ company: 'Acme', language: 'French', ticket: 'T-1' }} onVariablesChange={onVariablesChange} onRun={onRun} />,
    );
    const company = screen.getByRole('textbox', { name: 'company' });
    expect(company).toHaveValue('Acme');
    await user.type(company, 'x');
    expect(onVariablesChange).toHaveBeenLastCalledWith({ company: 'Acmex', language: 'French', ticket: 'T-1' });
    // Controlled: the parent has not updated the value.
    expect(company).toHaveValue('Acme');
    rerender(<PromptEditor variables={{ company: 'Globex', language: 'French', ticket: 'T-1' }} onVariablesChange={onVariablesChange} onRun={onRun} />);
    expect(company).toHaveValue('Globex');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledWith(expect.objectContaining({ variables: { company: 'Globex', language: 'French', ticket: 'T-1' } }));
  });

  it('controlled example: the page fills a variable', async () => {
    const user = userEvent.setup();
    render(<ControlledVariables />);
    expect(screen.getByText('1 variable has no value')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fill from sample ticket' }));
    expect(screen.getByRole('textbox', { name: 'ticket' })).toHaveValue('Cannot reset my password');
    expect(screen.queryByText('1 variable has no value')).toBeNull();
    await user.type(screen.getByRole('textbox', { name: 'company' }), ' Inc');
    expect(screen.getByRole('textbox', { name: 'company' })).toHaveValue('Acme Inc');
    await expectNoAxeViolations();
  });
});
