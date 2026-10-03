import { useId, useState } from 'react';
import { Braces, Play } from '@gntik-ai/icons';
import { Button, Field, FieldDescription, FieldLabel, Input, Slider, Textarea, Token, cn } from '@gntik-ai/ui';
import { promptDefaults } from './fixtures';

export interface PromptRunInput {
  system: string;
  user: string;
  /** Values for every variable found in the prompts (missing ones are empty strings). */
  variables: Record<string, string>;
  temperature: number;
  maxTokens: number;
}

export interface PromptEditorProps {
  title?: string;
  defaultSystem?: string;
  defaultUser?: string;
  defaultVariables?: Record<string, string>;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  /** Upper bound of the max-tokens input. */
  maxTokensLimit?: number;
  /** Called on Run; return a promise to show the running state until it settles. */
  onRun?: (input: PromptRunInput) => void | Promise<unknown>;
  className?: string;
}

const VARIABLE = /\{\{\s*([A-Za-z_][\w.]*)\s*\}\}/g;

/** Unique `{{variable}}` names, in order of appearance. */
export function extractPromptVariables(...texts: string[]): string[] {
  const seen = new Set<string>();
  for (const text of texts) for (const m of text.matchAll(VARIABLE)) if (m[1]) seen.add(m[1]);
  return [...seen];
}

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

/** Prompt playground: system + user prompts, detected variables, parameters and Run. */
export function PromptEditor({
  title = 'Prompt',
  defaultSystem = promptDefaults.system,
  defaultUser = promptDefaults.user,
  defaultVariables = promptDefaults.variables,
  defaultTemperature = promptDefaults.temperature,
  defaultMaxTokens = promptDefaults.maxTokens,
  maxTokensLimit = 8192,
  onRun,
  className,
}: PromptEditorProps) {
  const titleId = useId();
  const [system, setSystem] = useState(defaultSystem);
  const [user, setUser] = useState(defaultUser);
  const [values, setValues] = useState<Record<string, string>>(defaultVariables);
  const [temperature, setTemperature] = useState(defaultTemperature);
  const [maxTokens, setMaxTokens] = useState(String(defaultMaxTokens));
  const [running, setRunning] = useState(false);

  const variables = extractPromptVariables(system, user);
  const missing = variables.filter((v) => !values[v]?.trim());
  const maxTokensNumber = Number(maxTokens);
  const maxTokensInvalid = !Number.isInteger(maxTokensNumber) || maxTokensNumber < 1 || maxTokensNumber > maxTokensLimit;
  const canRun = user.trim().length > 0 && !maxTokensInvalid && !running;

  const run = () => {
    if (!canRun) return;
    const result = onRun?.({
      system,
      user,
      variables: Object.fromEntries(variables.map((v) => [v, values[v] ?? ''])),
      temperature,
      maxTokens: maxTokensNumber,
    });
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setRunning(true);
      void (result as Promise<unknown>).finally(() => setRunning(false));
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-secondary/35 px-4 py-2.5">
        <h3 id={titleId} className="text-[13.5px] font-semibold text-foreground">
          {title}
        </h3>
        <Button size="sm" icon={Play} loading={running} disabled={!canRun && !running} onClick={run}>
          {running ? 'Running…' : 'Run'}
        </Button>
      </header>
      <div className="grid md:grid-cols-[minmax(0,1fr)_272px]">
        <div className="flex flex-col gap-4 p-4">
          <Field>
            <FieldLabel>System prompt</FieldLabel>
            <Textarea rows={4} value={system} onValueChange={setSystem} className="font-mono text-[12.5px]" />
            <FieldDescription>~{estimateTokens(system)} tokens</FieldDescription>
          </Field>
          <Field>
            <FieldLabel required>User prompt</FieldLabel>
            <Textarea rows={6} value={user} onValueChange={setUser} invalid={user.trim().length === 0} className="font-mono text-[12.5px]" />
            <FieldDescription>
              ~{estimateTokens(user)} tokens · use <code className="font-mono">{'{{name}}'}</code> for variables
            </FieldDescription>
          </Field>
        </div>
        <div className="flex flex-col gap-5 border-t border-border bg-secondary/20 p-4 md:border-t-0 md:border-l">
          <div>
            <h4 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Variables</h4>
            {variables.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-muted-foreground">No variables in the prompts.</p>
            ) : (
              <>
                <ul aria-label="Detected variables" className="mt-2 flex flex-wrap gap-1.5">
                  {variables.map((v) => (
                    <li key={v}>
                      <Token
                        size="sm"
                        tone={values[v]?.trim() ? 'primary' : 'warning'}
                        icon={<Braces size={12} aria-hidden />}
                        label={v}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-col gap-2.5">
                  {variables.map((v) => (
                    <Field key={v}>
                      <FieldLabel className="font-mono text-[12px]">{v}</FieldLabel>
                      <Input size="sm" value={values[v] ?? ''} onValueChange={(next) => setValues((prev) => ({ ...prev, [v]: String(next) }))} />
                    </Field>
                  ))}
                </div>
                {missing.length > 0 && (
                  <p className="mt-2 text-[12px] text-warning-text">
                    {missing.length} {missing.length === 1 ? 'variable has' : 'variables have'} no value
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Parameters</h4>
            <Slider
              label="Temperature"
              showValue
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onValueChange={(v) => setTemperature(Array.isArray(v) ? (v[0] ?? 0) : v)}
            />
            <Field invalid={maxTokensInvalid}>
              <FieldLabel>Max tokens</FieldLabel>
              <Input
                size="sm"
                type="number"
                min={1}
                max={maxTokensLimit}
                step={1}
                value={maxTokens}
                onValueChange={(v) => setMaxTokens(String(v))}
                invalid={maxTokensInvalid}
              />
              <FieldDescription>1 – {maxTokensLimit.toLocaleString('en-US')}</FieldDescription>
            </Field>
          </div>
        </div>
      </div>
    </section>
  );
}
