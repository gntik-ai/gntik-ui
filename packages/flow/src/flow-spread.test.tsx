import { render, screen } from '@testing-library/react';
import { FlowCanvas, useFlowState } from './index';
import { pipelineEdges, pipelineNodes } from './examples/pipeline';

// Own file: React dedupes unknown-prop warnings per process, so sharing a file with other
// canvas renders would let an earlier test swallow the warnings this one asserts on.
describe('spreading the whole useFlowState result into FlowCanvas', () => {
  it('forwards no hook-only control to the DOM and logs no React warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Spread() {
      const flow = useFlowState(pipelineNodes, pipelineEdges);
      return <FlowCanvas aria-label="Spread canvas" {...flow} />;
    }
    render(<Spread />);
    const region = screen.getByRole('region', { name: 'Spread canvas' });
    expect(region.querySelector('[canundo], [canredo], [undo], [redo], [resethistory]')).toBeNull();
    expect(error.mock.calls.map((c) => String(c[0]) + String(c[1] ?? ''))).toEqual([]);
    error.mockRestore();
  });
});
