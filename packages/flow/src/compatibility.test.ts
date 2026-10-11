import { KIND_CHIP, type FlowNode, type FlowNodeData, type FlowNodeKind } from './index';

it('keeps the built-in FlowNode type compatible with existing consumers', () => {
  const node: FlowNode = { id: 'step', type: 'step', position: { x: 0, y: 0 }, data: { title: 'Step' } };
  const kind: FlowNodeKind | undefined = node.type;
  const chip: string = KIND_CHIP[node.type ?? 'step'];
  const hasIndexSignature: string extends keyof FlowNodeData ? true : false = false;
  expect(kind).toBe('step');
  expect(chip).toBe(KIND_CHIP.step);
  expect(hasIndexSignature).toBe(false);
});
