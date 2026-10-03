import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MonacoLoader } from '@gntik-ai/editor';
import { expectNoAxeViolations } from '../test/a11y';
import PromptPlaygroundPage from './Page';

/** Minimal Monaco stand-in (same approach as the CodePanel block tests). */
function mockMonaco() {
  const model = () => ({ getValue: () => '', setValue: vi.fn(), onDidChangeContent: () => ({ dispose: vi.fn() }), dispose: vi.fn() });
  const editor = {
    defineTheme: vi.fn(),
    setTheme: vi.fn(),
    setModelLanguage: vi.fn(),
    remeasureFonts: vi.fn(),
    createModel: vi.fn(() => model()),
    create: vi.fn(),
    createDiffEditor: vi.fn(() => ({ setModel: vi.fn(), getModel: () => null, updateOptions: vi.fn(), layout: vi.fn(), dispose: vi.fn() })),
  };
  return { editor, loader: (() => Promise.resolve({ editor })) as unknown as MonacoLoader };
}

describe('PromptPlaygroundPage', () => {
  it('renders the playground chrome, variables, prompt and model columns', { timeout: 15000 }, async () => {
    render(<PromptPlaygroundPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Ticket summary' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Variables' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Prompt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Column 1: general-large' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Column 2: general-small' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('runs every column with the shared variables and diffs against the first', { timeout: 15000 }, async () => {
    const m = mockMonaco();
    const onGenerate = vi.fn((model: string) => ({ text: `answer from ${model}`, latencyMs: 10, outputTokens: 3 }));
    render(<PromptPlaygroundPage onGenerate={onGenerate} loader={m.loader} />);
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(2));
    expect(onGenerate.mock.calls.map((c) => c[0])).toEqual(['general-large', 'general-small']);
    expect(onGenerate).toHaveBeenCalledWith('general-large', expect.objectContaining({ variables: expect.objectContaining({ company: 'Northwind' }) }));
    expect(await screen.findByText('answer from general-small')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Diff' }));
    await waitFor(() => expect(m.editor.createDiffEditor).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Changes against general-large.')).toBeInTheDocument();
  });

  it('adds a third model column and removes it', { timeout: 15000 }, async () => {
    render(<PromptPlaygroundPage />);
    const outputs = screen.getByRole('region', { name: 'Outputs' });
    await userEvent.click(within(outputs).getByRole('button', { name: 'Add model' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Column 3: reasoning-medium' })).toBeInTheDocument();
    expect(within(outputs).getByRole('button', { name: 'Add model' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Remove column 3' }));
    expect(screen.queryByRole('heading', { name: /Column 3/ })).toBeNull();
  });
});
