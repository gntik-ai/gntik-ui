import './styles.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, ThemeProvider, TooltipProvider } from '@gntik-ai/ui';
import { FlowBuilder, CodePanel } from '@gntik-ai/blocks';
import { NodeCard } from '@gntik-ai/flow';
import { WorkflowBuilderPage } from '@gntik-ai/templates';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') === 'run' ? 'run' : 'edit';
const theme = ['dark', 'light', 'high_contrast'].includes(params.get('theme')) ? params.get('theme') : 'dark';

const nodes = [
  {
    id: 'branch',
    type: 'branch',
    position: { x: 0, y: 64 },
    data: { title: 'Branch' },
  },
  {
    id: 'parallel',
    type: 'parallel',
    position: { x: 256, y: 0 },
    data: { title: 'Parallel' },
  },
  {
    id: 'sequence',
    type: 'sequence',
    position: { x: 256, y: 160 },
    data: { title: 'Sequence' },
  },
];
const nodeTypes = [
  {
    type: 'branch',
    handles: [
      { id: 'input', kind: 'target' },
      { id: 'arm-0', kind: 'source', label: 'First branch arm' },
      { id: 'arm-1', kind: 'source', label: 'Second branch arm' },
    ],
  },
  {
    type: 'parallel',
    handles: [
      { id: 'input', kind: 'target' },
      { id: 'branch', kind: 'source' },
    ],
  },
  {
    type: 'sequence',
    handles: [
      { id: 'input', kind: 'target' },
      { id: 'next', kind: 'source' },
    ],
  },
].map((definition) => ({
  ...definition,
  render: ({ data, selected }) => <NodeCard title={data.title} selected={selected} />,
}));

function onConnectEdge(connection) {
  if (connection.sourceType === 'branch')
    return {
      type: 'smoothstep',
      data: {
        kind: 'branch-arm',
        armIndex: Number(connection.sourceHandle?.split('-')[1]),
      },
    };
  return {
    type: 'smoothstep',
    data: {
      kind: connection.sourceType === 'parallel' ? 'parallel' : 'sequence',
    },
  };
}
const flowProps = {
  nodes,
  edges: [],
  nodeTypes,
  mode,
  onConnectEdge,
  isValidConnection: (c) =>
    c.source !== c.target || {
      code: 'self-loop',
      nodeId: c.source,
      message: 'A node cannot connect to itself.',
    },
  validationIssues: [
    { code: 'input', nodeId: 'branch', message: 'Review the branch input' },
    { code: 'terminal', message: 'Add a terminal step' },
  ],
  nodeStatus: { branch: 'running', parallel: 'paused', sequence: 'done' },
};

function Example() {
  const [loader, setLoader] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [rejection, setRejection] = useState(null);
  const graphProps = {
    ...flowProps,
    validationIssues: [...flowProps.validationIssues, ...(rejection ? [rejection] : [])],
    onConnectionRejected: setRejection,
  };
  const openEditor = async () => {
    try {
      // The entire integration, Monaco and both worker constructors are behind this import.
      const { yamlLoader } = await import('./examples/yaml-loader.js');
      setLoader(() => yamlLoader);
    } catch (error) {
      setError(String(error));
    }
  };
  if (params.get('item') === 'code-panel')
    return (
      <main className="p-6">
        <h1 className="mb-4 text-lg font-semibold text-foreground">Worker-backed YAML editor</h1>
        {!loader && <Button onClick={() => void openEditor()}>Open YAML editor</Button>}
        {error && <p role="alert">{error}</p>}
        {loader && (
          <CodePanel
            loader={loader}
            files={[
              {
                path: 'flow.yaml',
                language: 'yaml',
                content: 'count: wrong\n',
                original: 'count: 1\n',
              },
            ]}
            problems={[]}
            readOnly={mode === 'run'}
            markers={[
              {
                id: 'terminal',
                owner: 'semantic-worker',
                file: 'flow.yaml',
                line: 1,
                severity: 'warning',
                message: 'Review the terminal step',
              },
            ]}
          />
        )}
      </main>
    );
  if (params.get('item') === 'workflow-builder')
    return <WorkflowBuilderPage {...graphProps} onNodeSelect={setSelected} />;
  return (
    <main className="p-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Flow extensions</h1>
      <FlowBuilder {...graphProps} onNodeSelect={setSelected} />
      <p aria-live="polite">{selected && `Selected: ${selected}`}</p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultMode={theme} storageKey={null}>
    <TooltipProvider>
      <Example />
    </TooltipProvider>
  </ThemeProvider>,
);
