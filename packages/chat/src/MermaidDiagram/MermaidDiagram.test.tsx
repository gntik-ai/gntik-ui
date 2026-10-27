/* eslint-disable no-restricted-syntax -- Known CSS fixture colours independently verify runtime token mapping. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MermaidDiagram as ExampleDiagram, mermaidCodeRenderers as exampleRenderers } from '@gntik-ai/chat/mermaid';
import { Markdown } from '../Markdown';
import { MermaidDiagram, mermaidCodeRenderers } from './index';
import MermaidDiagramReply from './examples/MermaidDiagramReply';
import MermaidDiagramStates from './examples/MermaidDiagramStates';
import { expectNoAxeViolations } from '../test/a11y';

const engine = vi.hoisted(() => ({
  imports: 0,
  initialize: vi.fn(),
  render: vi.fn(),
}));
vi.mock('mermaid', () => {
  engine.imports++;
  return { default: engine };
});
const source = 'graph TD; A-->B';
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text>Ready</text></svg>';
beforeEach(() => {
  engine.initialize.mockClear();
  engine.render.mockReset().mockResolvedValue({ svg });
});

it('shares the source entry and renderer map with the live examples', () => {
  expect(ExampleDiagram).toBe(MermaidDiagram);
  expect(exampleRenderers).toBe(mermaidCodeRenderers);
});

it('loads once for several closed Markdown fences and shows code and status until ready', async () => {
  const streaming = render(<MermaidDiagram code={source} streaming />);
  await act(async () => {});
  expect(engine.imports).toBe(0);
  streaming.unmount();
  let finish!: (value: { svg: string }) => void;
  engine.render.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <Markdown
      codeRenderers={mermaidCodeRenderers}
    >{`\`\`\`mermaid\n${source}\n\`\`\`\n\n\`\`\`mermaid\n${source}\n\`\`\``}</Markdown>,
  );
  expect(screen.getAllByText('Rendering diagram…')).toHaveLength(2);
  expect(screen.getAllByText(source)).toHaveLength(2);
  await waitFor(() => expect(engine.render).toHaveBeenCalled());
  await act(async () => finish({ svg }));
  await waitFor(() => expect(screen.getAllByText('Ready')).toHaveLength(2));
  expect(screen.getAllByRole('figure', { name: 'Diagram' })).toHaveLength(2);
  expect(engine.imports).toBe(1);
  expect(engine.initialize).toHaveBeenCalledWith(
    expect.objectContaining({ startOnLoad: false, securityLevel: 'strict', theme: 'base' }),
  );
  expect(engine.render.mock.calls[0]?.[0]).not.toBe(engine.render.mock.calls[1]?.[0]);
});

it('does not render streamed source or incomplete Markdown fences, but renders a closed fence during a reply', async () => {
  const direct = render(<MermaidDiagram code={source} streaming />);
  await act(async () => {});
  expect(engine.render).not.toHaveBeenCalled();
  expect(screen.getByText(source)).toBeVisible();
  direct.unmount();
  const markdown = render(
    <Markdown streaming codeRenderers={mermaidCodeRenderers}>{`\`\`\`mermaid\n${source}`}</Markdown>,
  );
  await act(async () => {});
  expect(engine.render).not.toHaveBeenCalled();
  markdown.rerender(
    <Markdown streaming codeRenderers={mermaidCodeRenderers}>{`\`\`\`mermaid\n${source}\n\`\`\``}</Markdown>,
  );
  expect(await screen.findByText('Ready')).toBeVisible();
  expect(engine.render).toHaveBeenCalledTimes(1);
});

it('falls back to code and a failure note without disturbing sibling content', async () => {
  engine.render.mockRejectedValueOnce(new Error('Parse error'));
  render(
    <>
      <MermaidDiagram code="graph TD; A-->" />
      <p>Sibling reply</p>
    </>,
  );
  expect(await screen.findByText('Could not render the diagram')).toBeVisible();
  expect(screen.getByText('graph TD; A-->')).toBeVisible();
  expect(screen.getByText('Sibling reply')).toBeVisible();
});

it.each(['graph TD; A-->B; click A call alert()', 'graph TD; A["<img src=x onerror=alert(1)>"]'])(
  'sanitises the inserted SVG for hostile source %s',
  async (code) => {
    engine.render.mockResolvedValueOnce({
      svg: `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
    <script>alert(1)</script><foreignObject><img xmlns="http://www.w3.org/1999/xhtml" src="x" onerror="alert(1)" /></foreignObject>
    <a href="java&#x09;script:alert(1)" onclick="alert(1)"><text>Safe label</text></a>
    <animate attributeName="href" values="javascript:alert(1)" /><image href="https://tracker.invalid/pixel" />
    <STYLE>@import 'https://tracker.invalid/style';</STYLE>
  </svg>`,
    });
    render(<MermaidDiagram code={code} />);
    expect(await screen.findByText('Safe label')).toBeVisible();
    const inserted = screen.getByRole('region', { name: 'Diagram' }).querySelector('svg')!;
    expect(inserted.querySelector('script, foreignObject, animate, image')).toBeNull();
    for (const element of [inserted, ...inserted.querySelectorAll('*')]) {
      for (const attribute of element.attributes) {
        expect(attribute.name).not.toMatch(/^on/i);
        expect(attribute.value.replace(/\s/g, '')).not.toMatch(/javascript:/i);
      }
    }
    expect(inserted.textContent).not.toContain('tracker.invalid');
  },
);

it('reads contrast-safe tokens again on theme changes and disconnects its observer', async () => {
  const css = document.createElement('style');
  css.textContent =
    ':root { --foreground: 0 0% 95%; --secondary: 0 0% 10%; --background: 0 0% 5%; --border: 0 0% 40%; } .light { --foreground: 0 0% 10%; --secondary: 0 0% 95%; --background: 0 0% 100%; }';
  document.head.append(css);
  document.documentElement.className = 'dark';
  const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
  const { unmount } = render(<MermaidDiagram code={source} />);
  await screen.findByText('Ready');
  expect(engine.initialize).toHaveBeenLastCalledWith(
    expect.objectContaining({
      themeVariables: expect.objectContaining({ primaryColor: '#1a1a1a', primaryTextColor: '#f2f2f2' }),
    }),
  );
  act(() => {
    document.documentElement.className = 'light';
  });
  await waitFor(() => expect(engine.render).toHaveBeenCalledTimes(2));
  expect(engine.initialize).toHaveBeenLastCalledWith(
    expect.objectContaining({
      themeVariables: expect.objectContaining({ primaryColor: '#f2f2f2', primaryTextColor: '#1a1a1a' }),
    }),
  );
  unmount();
  expect(disconnect).toHaveBeenCalled();
  css.remove();
  disconnect.mockRestore();
});

it('supports default code view, view callbacks, source copying and sanitised SVG downloads', async () => {
  const user = (await import('@testing-library/user-event')).default.setup();
  const copied = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  const create = vi.fn((blob: Blob) => {
    expect(blob.type).toBe('image/svg+xml');
    return 'blob:diagram';
  });
  const revoke = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = revoke;
    },
  );
  const clicks: { name: string; href: string }[] = [];
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicks.push({ name: this.download, href: this.href });
  });
  const onViewChange = vi.fn();
  render(
    <MermaidDiagram
      code={source}
      defaultView="code"
      label="Architecture"
      className="max-w-xl"
      onViewChange={onViewChange}
    />,
  );
  await waitFor(() => expect(engine.render).toHaveBeenCalled());
  expect(screen.getByRole('figure', { name: 'Architecture' })).toHaveClass('max-w-xl');
  expect(screen.getByRole('button', { name: 'Show code' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'Show diagram' }));
  expect(await screen.findByText('Ready')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Show diagram' })).toHaveAttribute('aria-pressed', 'true');
  expect(onViewChange).toHaveBeenLastCalledWith('diagram');
  await user.click(screen.getByRole('button', { name: 'Copy code' }));
  expect(copied).toHaveBeenCalledWith(source);
  await user.click(screen.getByRole('button', { name: 'Download SVG' }));
  expect(clicks).toEqual([{ name: 'diagram.svg', href: 'blob:diagram' }]);
  expect(create.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
  await user.click(screen.getByRole('button', { name: 'Show code' }));
  expect(screen.getByText(source)).toBeVisible();
  expect(onViewChange).toHaveBeenLastCalledWith('code');
  click.mockRestore();
  copied.mockRestore();
  vi.unstubAllGlobals();
});

it('zooms, resets and pans through the focused viewport, toolbar and pointer drag', async () => {
  render(<MermaidDiagram code={source} />);
  await screen.findByText('Ready');
  const viewport = screen.getByRole('region', { name: 'Diagram' });
  const canvas = screen.getByText('Ready').closest('svg')!.parentElement!;
  viewport.focus();
  fireEvent.keyDown(viewport, { key: '+' });
  expect(canvas.style.transform).toBe('translate(0px, 0px) scale(1.2)');
  fireEvent.keyDown(viewport, { key: '-' });
  expect(canvas.style.transform).toBe('translate(0px, 0px) scale(1)');
  for (const key of ['ArrowRight', 'ArrowDown']) fireEvent.keyDown(viewport, { key });
  expect(canvas.style.transform).toBe('translate(24px, 24px) scale(1)');
  for (const key of ['ArrowLeft', 'ArrowUp']) fireEvent.keyDown(viewport, { key });
  expect(canvas.style.transform).toBe('translate(0px, 0px) scale(1)');
  fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
  fireEvent.keyDown(viewport, { key: '0' });
  expect(canvas.style.transform).toBe('translate(0px, 0px) scale(1)');
  fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
  expect(canvas.style.transform).toBe('translate(0px, 0px) scale(0.8)');
  fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
  expect(canvas.style.transform).toBe('translate(0px, 0px) scale(1)');
  fireEvent.pointerDown(viewport, { pointerId: 1, button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 50, clientY: 30 });
  fireEvent.pointerUp(viewport, { pointerId: 1 });
  expect(canvas.style.transform).toBe('translate(40px, 20px) scale(1)');
  // The canvas has no transition or animation, including under reduced motion.
  expect(canvas.className).not.toMatch(/transition|animate/);
});

it('never shows an old SVG or old failure for new source, and ignores results after unmount', async () => {
  const diagram = render(<MermaidDiagram code={source} />);
  await screen.findByText('Ready');
  let finish!: (value: { svg: string }) => void;
  engine.render.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  diagram.rerender(<MermaidDiagram code="graph TD; B-->C" />);
  expect(screen.queryByText('Ready')).toBeNull();
  expect(screen.getByText('Rendering diagram…')).toBeVisible();
  await waitFor(() => expect(engine.render).toHaveBeenCalledTimes(2));
  diagram.rerender(<MermaidDiagram code="graph TD; C-->D" />);
  await act(async () => finish({ svg: svg.replace('Ready', 'Obsolete') }));
  expect(await screen.findByText('Ready')).toBeVisible();
  expect(screen.queryByText('Obsolete')).toBeNull();
  engine.render.mockRejectedValueOnce(new Error('Invalid source'));
  diagram.rerender(<MermaidDiagram code="graph TD; A-->" />);
  await screen.findByText('Could not render the diagram');
  diagram.rerender(<MermaidDiagram code={source} />);
  expect(await screen.findByText('Ready')).toBeVisible();
  engine.render.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  diagram.rerender(<MermaidDiagram code="graph TD; D-->E" />);
  await waitFor(() => expect(engine.render).toHaveBeenCalledTimes(6));
  diagram.unmount();
  await act(async () => finish({ svg }));
  expect(screen.queryByRole('figure')).toBeNull();
});

it.each(['dark', 'light', 'high_contrast'])('the live example has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(<MermaidDiagramReply />);
  await screen.findByText('Ready');
  await expectNoAxeViolations(container);
});

it('preserves static Mermaid styles while stripping its built-in animation rules', async () => {
  engine.render.mockResolvedValueOnce({
    svg: `<svg xmlns="http://www.w3.org/2000/svg"><style>
    .node { fill: var(--secondary); } @keyframes edge-animation-frame { from { stroke-dashoffset: 0; } }
    .edge { stroke: var(--foreground); animation: edge-animation-frame 1s linear infinite; }
  </style><text>Styled diagram</text></svg>`,
  });
  render(<MermaidDiagram code={source} />);
  await screen.findByText('Styled diagram');
  const style = screen.getByRole('region', { name: 'Diagram' }).querySelector('style');
  expect(style?.textContent).toContain('.node');
  expect(style?.textContent).toContain('.edge');
  expect(style?.textContent).not.toMatch(/keyframes|animation/);
});

it('preserves sequence diagram child selectors and their theme colours', async () => {
  // Mermaid 12.2.0 sequenceDiagram styles, with known contrast-safe token values.
  const css = 'text.actor > tspan { fill: #f2f2f2; stroke: none; } .noteText > tspan { fill: #f2f2f2; }';
  engine.render.mockResolvedValueOnce({
    svg: `<svg xmlns="http://www.w3.org/2000/svg"><style>${css}</style><text class="noteText"><tspan>Sequence note</tspan></text></svg>`,
  });
  render(<MermaidDiagram code="sequenceDiagram\nAlice->>Bob: Hello" />);
  await screen.findByText('Sequence note');
  const style = screen.getByRole('region', { name: 'Diagram' }).querySelector('style');
  expect(style?.textContent).toBe(css);
});

it.each([
  '.noteText > tspan { fill: url(https://tracker.invalid/image); }',
  '@import "https://tracker.invalid/style"; .noteText > tspan { fill: var(--foreground); }',
  String.raw`.noteText > tspan { fill: u\72l(https://tracker.invalid/image); }`,
])('discards unsafe sequence diagram CSS: %s', async (css) => {
  engine.render.mockResolvedValueOnce({
    svg: `<svg xmlns="http://www.w3.org/2000/svg"><style>${css}</style><text>Safe sequence note</text></svg>`,
  });
  render(<MermaidDiagram code="sequenceDiagram\nAlice->>Bob: Hello" />);
  await screen.findByText('Safe sequence note');
  expect(screen.getByRole('region', { name: 'Diagram' }).querySelector('style')).toBeNull();
});

it('reports the code view while streaming and exposes the loaded toolbar and viewport by keyboard', async () => {
  const user = (await import('@testing-library/user-event')).default.setup();
  const diagram = render(<MermaidDiagram code={source} streaming />);
  expect(screen.getByRole('button', { name: 'Show code' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Show diagram' })).toBeDisabled();
  diagram.rerender(<MermaidDiagram code={source} />);
  await screen.findByText('Ready');
  const names = ['Show diagram', 'Show code', 'Copy code', 'Download SVG', 'Zoom in', 'Zoom out', 'Reset zoom'];
  for (const name of names) {
    await user.tab();
    expect(screen.getByRole('button', { name })).toHaveFocus();
  }
  await user.tab();
  expect(screen.getByRole('region', { name: 'Diagram' })).toHaveFocus();
  screen.getByRole('button', { name: 'Show code' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByText(source)).toBeVisible();
  screen.getByRole('button', { name: 'Show diagram' }).focus();
  await user.keyboard(' ');
  expect(screen.getByText('Ready')).toBeVisible();
});

it.each(['dark', 'light', 'high_contrast'])(
  'the Spanish state examples have no axe violations in %s',
  async (theme) => {
    document.documentElement.className = theme;
    engine.render.mockImplementation((_id: string, code: string) =>
      code.endsWith('-->') ? Promise.reject(new Error('Parse error')) : Promise.resolve({ svg }),
    );
    const { container } = render(<MermaidDiagramStates />);
    await screen.findByText('No se pudo renderizar el diagrama');
    expect(screen.getAllByRole('button', { name: 'Mostrar código' })).toHaveLength(3);
    await expectNoAxeViolations(container);
  },
);
