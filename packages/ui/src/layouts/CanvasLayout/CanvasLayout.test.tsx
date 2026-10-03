import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { CanvasLayout } from './CanvasLayout';
import CanvasLayoutFlowEditor from './examples/CanvasLayoutFlowEditor';

describe('CanvasLayout', () => {
  it('renders the landmarks and fills its container', () => {
    const { container } = render(
      <CanvasLayout header="Flow" palette="Nodes" inspector="Props" console="Logs">
        canvas
      </CanvasLayout>,
    );
    expect(container.firstElementChild).toHaveClass('h-full');
    expect(screen.getByRole('banner')).toHaveTextContent('Flow');
    expect(screen.getByRole('main', { name: 'Canvas' })).toHaveTextContent('canvas');
    expect(screen.getByRole('complementary', { name: 'Palette' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Inspector' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Console' })).toBeInTheDocument();
    expect(screen.getByText(/Open on a larger screen to edit/)).toBeInTheDocument();
  });

  it('fullScreen switches to the viewport height', () => {
    const { container } = render(<CanvasLayout fullScreen>canvas</CanvasLayout>);
    expect(container.firstElementChild).toHaveClass('h-dvh');
  });

  it('the skip link moves focus to the canvas', async () => {
    const user = userEvent.setup();
    render(<CanvasLayout>canvas</CanvasLayout>);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to canvas' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('panel toggles show and hide the palette and inspector with aria-expanded', async () => {
    const user = userEvent.setup();
    const onInspector = vi.fn();
    render(<CanvasLayout palette="Nodes" inspector="Props" onInspectorOpenChange={onInspector} />);
    const paletteToggle = screen.getByRole('button', { name: 'Palette' });
    const inspectorToggle = screen.getByRole('button', { name: 'Inspector' });
    expect(paletteToggle).toHaveAttribute('aria-expanded', 'true');
    paletteToggle.focus();
    await user.keyboard('{Enter}');
    expect(paletteToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('complementary', { name: 'Palette' })).not.toBeInTheDocument();
    await user.tab();
    expect(inspectorToggle).toHaveFocus();
    await user.keyboard(' ');
    expect(inspectorToggle).toHaveAttribute('aria-expanded', 'false');
    expect(onInspector).toHaveBeenCalledWith(false);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('complementary', { name: 'Inspector' })).toBeVisible();
  });

  it('the console collapses and expands from its bar', async () => {
    const user = userEvent.setup();
    render(<CanvasLayout console="12:00 build ok" />);
    const toggle = screen.getByRole('button', { name: 'Console' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('12:00 build ok')).toBeVisible();
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('12:00 build ok')).not.toBeVisible();
  });

  it('controlled panels follow their props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CanvasLayout palette="Nodes" paletteOpen={false} onPaletteOpenChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Palette' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Palette' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('the example selects a node and has no axe violations', async () => {
    const user = userEvent.setup();
    render(<CanvasLayoutFlowEditor />);
    await user.click(screen.getByRole('button', { name: /Load project/ }));
    expect(screen.getByRole('button', { name: /Load project/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Load project');
    await expectNoAxeViolations();
  });
});
