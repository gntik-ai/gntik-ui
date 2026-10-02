import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FLOW_TONES, NodeCard, flowNodeTypes, useFlowTheme, withBrandMarkers, type FlowTone } from './index';
import NodeTypesStrip from './examples/NodeTypesStrip';
import PipelineCanvas from './examples/PipelineCanvas';
import { pipelineEdges } from './examples/pipeline';

function setTokens(vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v);
}

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  setTokens({ '--primary': '145 61% 50%', '--muted-foreground': '150 8% 40%', '--border': '90 14% 86%' });
});

describe('FlowCanvas', () => {
  it('renders the interactive pipeline as a named region with nodes, controls and minimap', () => {
    render(<PipelineCanvas />);
    const region = screen.getByRole('region', { name: 'Data pipeline' });
    for (const title of ['Ingest', 'Validate', 'Route', 'Transform', 'Enrich', 'Review', 'Publish']) {
      expect(within(region).getAllByText(title).length).toBeGreaterThan(0);
    }
    expect(region.querySelectorAll('.react-flow__node')).toHaveLength(7);
    expect(within(region).getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(region.querySelector('.react-flow__minimap')).not.toBeNull();
    expect(region.querySelector('.react-flow__background')).not.toBeNull();
    expect(region).toHaveClass('gu-flow');
  });

  it('static mode drops controls and minimap', () => {
    render(<NodeTypesStrip />);
    const region = screen.getByRole('region', { name: 'Node types' });
    expect(within(region).getByText('Router')).toBeInTheDocument();
    expect(within(region).queryByRole('button', { name: /zoom in/i })).toBeNull();
    expect(region.querySelector('.react-flow__minimap')).toBeNull();
  });

  it('exposes the four brand node types', () => {
    expect(Object.keys(flowNodeTypes)).toEqual(['trigger', 'step', 'router', 'output']);
  });
});

describe('NodeCard', () => {
  it.each(Object.keys(FLOW_TONES) as FlowTone[])('shows the %s tone label', (tone) => {
    render(<NodeCard title="Job" subtitle="sub" tone={tone} />);
    expect(screen.getByText(FLOW_TONES[tone].label)).toBeInTheDocument();
  });

  it('draws the marching border only while running', () => {
    const { container, rerender } = render(<NodeCard title="Job" tone="running" />);
    expect(container.querySelector('.gu-flow-run')).not.toBeNull();
    rerender(<NodeCard title="Job" tone="done" />);
    expect(container.querySelector('.gu-flow-run')).toBeNull();
  });
});

describe('token adapter wiring', () => {
  it('useFlowTheme resolves tokens and re-reads them on theme change', async () => {
    const { result } = renderHook(() => useFlowTheme());
    expect(result.current.edgeActive).toBe('hsl(145 61% 50%)');
    expect(result.current.pattern).toBe('hsl(90 14% 86%)');
    act(() => {
      setTokens({ '--primary': '136 100% 48%' });
      document.documentElement.classList.add('high_contrast');
    });
    await waitFor(() => expect(result.current.theme).toBe('high_contrast'));
    expect(result.current.edgeActive).toBe('hsl(136 100% 48%)');
  });

  it('withBrandMarkers colours arrows by edge state and keeps explicit markers', () => {
    const { result } = renderHook(() => useFlowTheme());
    const out = withBrandMarkers([...pipelineEdges, { id: 'x', source: 'a', target: 'b', markerEnd: 'custom' }], result.current);
    expect(out[0]?.markerEnd).toMatchObject({ color: 'hsl(145 61% 50%)' });
    expect(out[2]?.markerEnd).toMatchObject({ color: 'hsl(150 8% 40%)' });
    expect(out.at(-1)?.markerEnd).toBe('custom');
  });

  it('the canvas stamps the active theme on its wrapper', () => {
    document.documentElement.classList.add('dark');
    render(<NodeTypesStrip />);
    expect(screen.getByRole('region', { name: 'Node types' })).toHaveAttribute('data-theme', 'dark');
  });
});

describe('styles.css', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
  it('imports the xyflow base styles and maps --xy-* variables to tokens only', () => {
    expect(css).toContain('@import "@xyflow/react/dist/style.css";');
    const decls = css.match(/--xy-[a-z-]+:\s*[^;]+;/g) ?? [];
    expect(decls.length).toBeGreaterThan(25);
    for (const d of decls) expect(d).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    expect(css).toMatch(/\.high_contrast \.gu-flow/);
  });
});
