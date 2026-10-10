import { Button, Heading, Stack } from '@gntik-ai/ui';
import { ErrorPanel, FirstRunEmpty } from '@gntik-ai/blocks';
import { useState } from 'react';
import CreateWizardPage from '../Page';

/** Keep this component mounted: closing preserves the wizard's answers and current step. */
export default function CreateWizardOverlay() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [sourceUnavailable, setSourceUnavailable] = useState(true);
  return <>
    <main className="p-6">
      <Stack gap={4}>
        <Heading level={1}>Projects</Heading>
        <Button onClick={() => setOpen(true)}>New project</Button>
        <ul>{projects.map((name) => <li key={name}>{name}</li>)}</ul>
      </Stack>
    </main>
    <CreateWizardPage mode="overlay" open={open} onOpenChange={setOpen} description="Create a project over this list."
      pendingLabel="Creating project…"
      onFinish={(values) => { setProjects((items) => [...items, values.name]); setOpen(false); }}
      stepFeedback={(step) => step === 1 && sourceUnavailable ? (
        <ErrorPanel title="Sources are unavailable" message="Retry or continue with a blank project." code={503}
          requestId="" details="" secondaryAction={null} retryLabel="Retry sources" onRetry={() => setSourceUnavailable(false)} />
      ) : step === 1 ? (
        <FirstRunEmpty title="No saved sources" description="You can connect a source later." steps={[]} secondary={null}
          actionLabel="Refresh sources" onAction={() => setSourceUnavailable(true)} />
      ) : null}
    />
  </>;
}
