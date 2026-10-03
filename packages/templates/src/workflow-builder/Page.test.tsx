import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
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
});
