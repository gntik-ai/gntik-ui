import { PromptEditor, type PromptRunInput } from '@gntik-ai/blocks';
import { DiffEditor, type MonacoLoader } from '@gntik-ai/editor';
import { Plus, X } from '@gntik-ai/icons';
import {
  Badge,
  Button,
  CanvasLayout,
  Grid,
  HStack,
  IconButton,
  ListInput,
  Section,
  SimpleSelect,
  Stack,
  Switch,
  type BreadcrumbItem,
  type ListInputPair,
  type ListInputRow,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  playgroundBreadcrumbs,
  playgroundDefaultColumns,
  playgroundModels,
  playgroundPrompt,
  playgroundVariables,
  sampleOutput,
  simulateGenerate,
  type PlaygroundModel,
  type PlaygroundOutput,
} from './data';

export interface PromptPlaygroundProps {
  title: string;
  /** Initial prompt (system, user, temperature, max tokens). */
  prompt: { system: string; user: string; temperature: number; maxTokens: number };
  /** Initial shared variables (ListInput rows); non-empty values override the editor's own fields. */
  variables: ListInputPair[];
  models: PlaygroundModel[];
  /** Model ids of the initial columns (2–3). */
  defaultColumns: string[];
  /** Runs the prompt on one model. Defaults to a simulated answer. */
  onGenerate: (model: string, input: PromptRunInput) => PlaygroundOutput | Promise<PlaygroundOutput>;
  /** Monaco loader for the diff view (self-hosting, tests). */
  loader: MonacoLoader;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

const MAX_COLUMNS = 3;

interface Column {
  id: number;
  model: string;
  output?: PlaygroundOutput;
  error?: string;
}

/**
 * Prompt playground. CanvasLayout `embedded` inside ConsoleShell: the playground is a console
 * tool people jump in and out of (from a trace, an evaluation), so the app nav stays; the
 * canvas layout still gives it the editor chrome (top bar, variables palette). PromptEditor
 * runs the prompt on 2–3 model columns side by side; "Diff" compares each column against the
 * first one in a DiffEditor.
 */
export default function PromptPlaygroundPage(props: Partial<PromptPlaygroundProps>) {
  const {
    title = playgroundPrompt.title,
    prompt = playgroundPrompt,
    variables = playgroundVariables,
    models = playgroundModels,
    defaultColumns = playgroundDefaultColumns,
    onGenerate = simulateGenerate,
    loader,
    breadcrumbs = playgroundBreadcrumbs,
    currentHref = '/prompts',
    shell,
  } = props;
  const [rows, setRows] = useState<ListInputRow[] | undefined>(undefined);
  const [columns, setColumns] = useState<Column[]>(() =>
    defaultColumns.slice(0, MAX_COLUMNS).map((model, id) => ({ id, model, output: sampleOutput(model) })),
  );
  const [nextId, setNextId] = useState(defaultColumns.length);
  const [diff, setDiff] = useState(false);
  const [status, setStatus] = useState('');

  const shared = Object.fromEntries((rows ?? variables).filter((r) => r.key.trim() && r.value.trim()).map((r) => [r.key.trim(), r.value]));
  const modelItems = models.map((m) => ({ value: m.id, label: m.label }));
  const labelOf = (id: string) => models.find((m) => m.id === id)?.label ?? id;
  const baseline = columns[0];

  const run = async (input: PromptRunInput) => {
    const merged: PromptRunInput = { ...input, variables: { ...input.variables, ...shared } };
    setStatus(`Running on ${columns.length} models…`);
    const results = await Promise.all(
      columns.map(async (c) => {
        try {
          return { id: c.id, output: await onGenerate(c.model, merged) };
        } catch (e) {
          return { id: c.id, error: e instanceof Error ? e.message : 'The model did not answer.' };
        }
      }),
    );
    setColumns((cols) => cols.map((c) => ({ ...c, ...results.find((r) => r.id === c.id) })));
    setStatus(`Finished on ${results.length} models.`);
  };

  const addColumn = () => {
    const model = models.find((m) => !columns.some((c) => c.model === m.id))?.id ?? models[0]?.id ?? '';
    setColumns((cols) => [...cols, { id: nextId, model }]);
    setNextId((n) => n + 1);
  };

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <CanvasLayout
        embedded
        mainId="playground-canvas"
        mainLabel={`${title} playground`}
        smallScreenNotice={null}
        paletteLabel="Variables"
        palette={
          <Stack gap={2}>
            <p className="text-[12px] text-muted-foreground">Shared by every model column. Paste KEY=value lines to add several.</p>
            <ListInput label="Prompt variables" defaultValue={variables} onValueChange={setRows} uniqueKeys keyPlaceholder="name" valuePlaceholder="value" />
          </Stack>
        }
        header={
          <>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <h1 className="truncate text-[14px] font-semibold text-foreground">{title}</h1>
              <Badge size="sm">Playground</Badge>
              <p aria-live="polite" className="hidden truncate text-[12px] text-muted-foreground sm:block">
                {status}
              </p>
            </div>
            <Switch label="Diff" checked={diff} onCheckedChange={setDiff} disabled={columns.length < 2} />
          </>
        }
      >
        <div className="h-full overflow-y-auto p-3 sm:p-4">
          <Stack gap={4}>
            <PromptEditor
              titleAs="h2"
              title="Prompt"
              defaultSystem={prompt.system}
              defaultUser={prompt.user}
              defaultVariables={Object.fromEntries(variables.map((v) => [v.key, v.value]))}
              defaultTemperature={prompt.temperature}
              defaultMaxTokens={prompt.maxTokens}
              onRun={run}
            />
            <Section
              title="Outputs"
              headingLevel="h2"
              description={diff && baseline ? `Changes against ${labelOf(baseline.model)}.` : 'Each column runs the same prompt.'}
              actions={
                <Button size="sm" variant="secondary" icon={Plus} disabled={columns.length >= MAX_COLUMNS} onClick={addColumn}>
                  Add model
                </Button>
              }
            >
              <Grid cols={{ base: 1, md: columns.length >= 3 ? 3 : 2 }} gap={3}>
                {columns.map((c, i) => (
                  <Section
                    key={c.id}
                    variant="card"
                    padding="sm"
                    headingLevel="h3"
                    title={`Column ${i + 1}: ${labelOf(c.model)}`}
                    actions={
                      columns.length > 2 && (
                        <IconButton size="sm" icon={X} label={`Remove column ${i + 1}`} onClick={() => setColumns((cols) => cols.filter((x) => x.id !== c.id))} />
                      )
                    }
                  >
                    <Stack gap={3}>
                      <SimpleSelect
                        aria-label={`Model for column ${i + 1}`}
                        size="sm"
                        items={modelItems}
                        value={c.model}
                        onValueChange={(model) => model && setColumns((cols) => cols.map((x) => (x.id === c.id ? { id: x.id, model } : x)))}
                      />
                      {c.error ? (
                        <p className="text-[12.5px] text-destructive-text">{c.error}</p>
                      ) : !c.output ? (
                        <p className="text-[12.5px] text-muted-foreground">Run the prompt to see this model&apos;s answer.</p>
                      ) : diff && i > 0 && baseline?.output ? (
                        <DiffEditor
                          original={baseline.output.text}
                          modified={c.output.text}
                          sideBySide={false}
                          height={220}
                          aria-label={`${labelOf(c.model)} compared with ${labelOf(baseline.model)}`}
                          loader={loader}
                        />
                      ) : (
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">{c.output.text}</p>
                      )}
                      {c.output && (
                        <HStack gap={2} wrap>
                          <Badge size="sm" className="font-mono">
                            {c.output.latencyMs} ms
                          </Badge>
                          <Badge size="sm" className="font-mono">
                            {c.output.outputTokens} tokens
                          </Badge>
                        </HStack>
                      )}
                    </Stack>
                  </Section>
                ))}
              </Grid>
            </Section>
          </Stack>
        </div>
      </CanvasLayout>
    </ConsoleShell>
  );
}
