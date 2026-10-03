import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { useState } from 'react';
import type { ConsoleEntry } from '@gntik-ai/blocks';
import FlowBuilderPage from './Page';

// React Flow in jsdom reads the zoom from DOMMatrixReadOnly and node sizes from offset*.
beforeAll(() => {
  if (!('DOMMatrixReadOnly' in window)) {
    (window as unknown as { DOMMatrixReadOnly: unknown }).DOMMatrixReadOnly = class {
      m22 = 1;
    };
  }
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: { configurable: true, get: () => 90 },
    offsetWidth: { configurable: true, get: () => 208 },
  });
});

describe('FlowBuilderPage', () => {
  it('renders the editor chrome and the flow builder', { timeout: 15000 }, async () => {
    render(<FlowBuilderPage />);
    expect(screen.getByRole('main', { name: 'Order sync editor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Order sync' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Order sync canvas' })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: 'Run console' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('runs the flow and saves', { timeout: 15000 }, async () => {
    const onRun = vi.fn();
    const onSave = vi.fn(() => Promise.resolve());
    render(<FlowBuilderPage onRun={onRun} onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledOnce();
    expect(within(screen.getByRole('log', { name: 'Run console' })).getByText(/Run #1 started/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });

  it('passes a controlled console through to the builder', { timeout: 15000 }, async () => {
    function Host() {
      const [entries, setEntries] = useState<ConsoleEntry[]>([{ id: 'h', time: '09:00:00', level: 'info', message: 'Connected to runner' }]);
      return (
        <FlowBuilderPage
          consoleEntries={entries}
          onConsoleChange={setEntries}
          onRun={() => Promise.resolve([{ id: 'r', time: '09:00:01', level: 'success', message: 'Remote run ok' }])}
        />
      );
    }
    render(<Host />);
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(log).toHaveTextContent('Connected to runner');
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(await within(log).findByText('Remote run ok')).toBeInTheDocument();
    expect(log).toHaveTextContent('Connected to runner');
  });
});
