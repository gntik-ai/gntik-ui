import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { FlowBuilder } from './FlowBuilder';

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
  document.documentElement.style.setProperty('--primary', '145 61% 50%');
});

function setWide(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({ ...original(query), matches })) as typeof window.matchMedia;
  return () => (window.matchMedia = original);
}

describe('FlowBuilder', () => {
  it('renders palette, canvas, inspector and console; resizable on wide screens', async () => {
    const restore = setWide(true);
    try {
      render(<FlowBuilder />);
      const canvas = screen.getByRole('region', { name: 'Untitled flow canvas' });
      expect(canvas.querySelectorAll('.react-flow__node')).toHaveLength(5);
      expect(screen.getAllByRole('separator')).toHaveLength(3);
      expect(screen.getByText('Select a node to edit its fields.')).toBeInTheDocument();
      expect(screen.getByRole('log', { name: 'Run console' })).toHaveTextContent('Validation passed');
      await expectNoAxeViolations();
    } finally {
      restore();
    }
  });

  it('adds a node from the palette, edits it in the inspector and runs the flow', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    render(<FlowBuilder onRun={onRun} />);
    expect(screen.queryAllByRole('separator')).toHaveLength(0); // stacked on small screens
    await user.click(screen.getByRole('button', { name: /Add Step/ }));
    const canvas = screen.getByRole('region', { name: 'Untitled flow canvas' });
    expect(canvas.querySelectorAll('.react-flow__node')).toHaveLength(6);
    const titleInput = screen.getByRole('textbox', { name: 'Title' });
    expect(titleInput).toHaveValue('New step');
    fireEvent.change(titleInput, { target: { value: 'Enrich record' } });
    expect(within(canvas).getByText('Enrich record')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledWith(expect.objectContaining({ nodes: expect.any(Array), edges: expect.any(Array) }));
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(log).toHaveTextContent('Run #1 started · 6 nodes');
    expect(log).toHaveTextContent(/Enrich record completed/);

    await user.click(screen.getByRole('button', { name: 'Delete node' }));
    expect(canvas.querySelectorAll('.react-flow__node')).toHaveLength(5);
  });
});
