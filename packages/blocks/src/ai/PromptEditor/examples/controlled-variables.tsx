import { useState } from 'react';
import { PromptEditor } from '../PromptEditor';

/** The page owns the variable values, e.g. to fill them from a selected dataset row. */
export default function ControlledVariablesPromptEditor() {
  const [variables, setVariables] = useState<Record<string, string>>({ company: 'Acme', language: 'English', ticket: '' });
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setVariables((prev) => ({ ...prev, ticket: 'Cannot reset my password' }))}
        className="self-start text-[12.5px] text-primary-text underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        Fill from sample ticket
      </button>
      <PromptEditor variables={variables} onVariablesChange={setVariables} />
    </div>
  );
}
