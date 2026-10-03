import { ModelKeysList, type ModelKey } from '@gntik-ai/blocks';
import { Plus } from '@gntik-ai/icons';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Meter,
  PasswordInput,
  Section,
  SimpleSelect,
  Stack,
} from '@gntik-ai/ui';
import { useState, type FormEvent } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { maskSecret, modelProvidersNavItem, providerKeys, providerOptions, providerUsageLimits, type NewModelKeyInput, type ProviderUsageLimit } from './data';

export interface ModelProvidersProps extends SettingsFrameOptions {
  keys: ModelKey[];
  limits: ProviderUsageLimit[];
  providers: Array<{ value: string; label: string }>;
  /** Tests a key (the "Test" button); resolve true when the provider answered. */
  onTest: (key: ModelKey) => Promise<boolean> | boolean;
  onRevoke: (key: ModelKey) => void;
  /** Stores a new key and returns it masked. Defaults to a local, untested entry. */
  onAddKey: (input: NewModelKeyInput) => ModelKey | Promise<ModelKey>;
}

const EMPTY: NewModelKeyInput = { name: '', provider: '', endpoint: '', secret: '' };

/**
 * Model provider settings: SettingsFrame (shared settings nav + a "Model providers" item) with
 * the ModelKeysList (masked keys, test connection, revoke), an add-key dialog and the usage
 * limits as Meters.
 */
export default function ModelProvidersPage({
  keys: initialKeys = providerKeys,
  limits = providerUsageLimits,
  providers = providerOptions,
  onTest,
  onRevoke,
  onAddKey,
  extraNavItems = [],
  ...frame
}: Partial<ModelProvidersProps>) {
  const [keys, setKeys] = useState(initialKeys);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const needsEndpoint = draft.provider === 'openai-compatible' || draft.provider === 'self-hosted';
  const invalid = {
    name: !draft.name.trim(),
    provider: !draft.provider,
    endpoint: needsEndpoint && !/^https?:\/\/\S+$/.test(draft.endpoint.trim()),
    secret: draft.secret.trim().length < 8,
  };
  const set = (key: keyof NewModelKeyInput) => (value: string | null) => setDraft((d) => ({ ...d, [key]: value ?? '' }));

  const openDialog = () => {
    setDraft(EMPTY);
    setSubmitted(false);
    setOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.values(invalid).some(Boolean)) return;
    setSaving(true);
    try {
      const input = { ...draft, endpoint: needsEndpoint ? draft.endpoint.trim() : '' };
      const created = onAddKey
        ? await onAddKey(input)
        : { id: `key-${keys.length + 1}`, name: input.name.trim(), provider: input.provider, endpoint: input.endpoint || undefined, maskedKey: maskSecret(input.secret), status: 'untested' as const };
      setKeys((list) => [...list, created]);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsFrame
      page="model-providers"
      extraNavItems={[modelProvidersNavItem, ...extraNavItems.filter((i) => i.id !== modelProvidersNavItem.id)]}
      description="Connect the model providers your assistants call. Keys are encrypted at rest and only shown masked."
      actions={[{ label: 'Add provider key', icon: Plus, variant: 'primary', onClick: openDialog }]}
      {...frame}
    >
      <Stack gap={6}>
        <ModelKeysList titleAs="h2" title="Provider keys" keys={keys} onTest={onTest} onRevoke={onRevoke} />
        <Section variant="card" headingLevel="h2" title="Usage limits" description="Workspace-wide caps across every provider key.">
          <Stack gap={5}>
            {limits.map((l) => (
              <Meter key={l.id} label={l.label} value={l.value} max={l.max} valueLabel={l.valueLabel} aria-valuetext={l.valueLabel} note={l.note} />
            ))}
          </Stack>
        </Section>
      </Stack>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={(e) => void submit(e)} noValidate>
            <DialogHeader>
              <DialogTitle>Add provider key</DialogTitle>
              <DialogDescription>The key is stored encrypted; you will not be able to see it again.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Field invalid={submitted && invalid.name}>
                  <FieldLabel required>Name</FieldLabel>
                  <Input value={draft.name} onValueChange={set('name')} placeholder="Production" />
                </Field>
                <SimpleSelect label="Provider" items={providers} value={draft.provider || null} onValueChange={set('provider')} placeholder="Choose a provider…" />
                {needsEndpoint && (
                  <Field invalid={submitted && invalid.endpoint}>
                    <FieldLabel required>Endpoint URL</FieldLabel>
                    <Input type="url" value={draft.endpoint} onValueChange={set('endpoint')} placeholder="https://llm-gateway.internal/v1" className="font-mono" />
                  </Field>
                )}
                <Field invalid={submitted && invalid.secret}>
                  <FieldLabel required>API key</FieldLabel>
                  <PasswordInput value={draft.secret} onValueChange={set('secret')} autoComplete="off" className="font-mono" />
                  <FieldDescription>At least 8 characters. Test the connection after adding it.</FieldDescription>
                </Field>
                {submitted && invalid.provider && <p className="text-[12.5px] text-destructive-text">Choose a provider.</p>}
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Add key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsFrame>
  );
}
