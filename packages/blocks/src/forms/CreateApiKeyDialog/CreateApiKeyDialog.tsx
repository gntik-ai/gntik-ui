import {
  useI18n,
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  CodeBlock,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetLegend,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@gntik-ai/ui';
import { KeyRound } from '@gntik-ai/icons';
import { useState, type ReactElement } from 'react';
import { apiKeyExpiries, apiKeyScopes, generateDemoSecret, type ApiKeyExpiry, type ApiKeyScope } from './fixtures';

export type { ApiKeyExpiry, ApiKeyScope } from './fixtures';

export interface CreateApiKeyInput {
  name: string;
  scopes: string[];
  expiry: string;
}

export interface CreateApiKeyDialogLabels {
  title: string;
  description: string;
  name: string;
  namePlaceholder: string;
  nameRequired: string;
  scopes: string;
  scopesRequired: string;
  expiration: string;
  errorTitle: string;
  fallbackError: string;
  cancel: string;
  submit: string;
  successTitle: string;
  successDescription: string;
  warningTitle: string;
  warningDescription: string;
  secretLabel: string;
  done: string;
}

export interface CreateApiKeyDialogProps {
  labels?: Partial<CreateApiKeyDialogLabels>;
  scopes?: ApiKeyScope[];
  expiries?: ApiKeyExpiry[];
  defaultExpiry?: string;
  /** Creates the key and returns its secret (shown once). Defaults to a demo generator. */
  onCreate?: (input: CreateApiKeyInput) => string | Promise<string>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger element (rendered through Dialog.Trigger). Pass `null` when controlling `open` yourself. */
  trigger?: ReactElement | null;
}

/**
 * Two-step API key dialog: name, scopes and expiry, then the secret shown once in a CodeBlock
 * with copy. Closing the dialog discards the secret; it can't be shown again.
 */
export function CreateApiKeyDialog({
  labels,
  scopes = apiKeyScopes,
  expiries = apiKeyExpiries,
  defaultExpiry = '90d',
  onCreate = () => generateDemoSecret(),
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger = <Button icon={KeyRound} />,
}: CreateApiKeyDialogProps) {
  const { t } = useI18n();
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [expiry, setExpiry] = useState(defaultExpiry);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const open = openProp ?? innerOpen;
  const nameInvalid = submitted && name.trim() === '';
  const scopesInvalid = submitted && selected.length === 0;

  const setOpen = (next: boolean) => {
    if (loading && !next) return;
    if (!next) {
      setName('');
      setSelected([]);
      setExpiry(defaultExpiry);
      setSubmitted(false);
      setError(null);
      setSecret(null);
    }
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const submit = async () => {
    setSubmitted(true);
    setError(null);
    if (name.trim() === '' || selected.length === 0) return;
    setLoading(true);
    try {
      const value = await onCreate({ name: name.trim(), scopes: selected, expiry });
      setSecret(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : (labels?.fallbackError ?? t('createApiKey.fallbackError')));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger}>{labels?.title ?? t('createApiKey.title')}</DialogTrigger>}
      <DialogContent size="lg">
        {secret == null ? (
          <>
            <DialogHeader>
              <DialogTitle>{labels?.title ?? t('createApiKey.title')}</DialogTitle>
              <DialogDescription>{labels?.description ?? t('createApiKey.description')}</DialogDescription>
            </DialogHeader>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <DialogBody className="grid gap-5">
                <Field invalid={nameInvalid}>
                  <FieldLabel required>{labels?.name ?? t('createApiKey.name')}</FieldLabel>
                  <Input
                    value={name}
                    onValueChange={setName}
                    placeholder={labels?.namePlaceholder ?? t('createApiKey.namePlaceholder')}
                    required
                    autoComplete="off"
                  />
                  <FieldError match={nameInvalid}>{labels?.nameRequired ?? t('createApiKey.nameRequired')}</FieldError>
                </Field>
                <Fieldset
                  render={<CheckboxGroup value={selected} onValueChange={setSelected} />}
                  aria-invalid={scopesInvalid || undefined}
                >
                  <FieldsetLegend>{labels?.scopes ?? t('createApiKey.scopes')}</FieldsetLegend>
                  {scopes.map((s) => (
                    <Checkbox
                      key={s.value}
                      value={s.value}
                      label={<span className="font-mono">{s.label}</span>}
                      description={s.description}
                    />
                  ))}
                  {scopesInvalid && (
                    <p className="text-[12.5px] text-destructive-text">
                      {labels?.scopesRequired ?? t('createApiKey.scopesRequired')}
                    </p>
                  )}
                </Fieldset>
                <Field>
                  <FieldLabel>{labels?.expiration ?? t('createApiKey.expiration')}</FieldLabel>
                  <Select value={expiry} onValueChange={(v) => v != null && setExpiry(v)} items={expiries}>
                    <SelectTrigger className="w-full sm:w-56" />
                    <SelectContent>
                      {expiries.map((x) => (
                        <SelectItem key={x.value} value={x.value}>
                          {x.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {error && (
                  <Alert
                    tone="destructive"
                    title={labels?.errorTitle ?? t('createApiKey.errorTitle')}
                    description={error}
                  />
                )}
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" disabled={loading} />}>
                  {labels?.cancel ?? t('createApiKey.cancel')}
                </DialogClose>
                <Button type="submit" loading={loading}>
                  {labels?.submit ?? t('createApiKey.submit')}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{labels?.successTitle ?? t('createApiKey.successTitle')}</DialogTitle>
              <DialogDescription>
                {labels?.successDescription ?? t('createApiKey.successDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="grid gap-4">
              <Alert
                tone="warning"
                title={labels?.warningTitle ?? t('createApiKey.warningTitle')}
                description={labels?.warningDescription ?? t('createApiKey.warningDescription')}
              />
              <CodeBlock
                code={secret}
                label={labels?.secretLabel ?? t('createApiKey.secretLabel')}
                wrapToggle={false}
                defaultWrap
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose render={<Button />}>{labels?.done ?? t('createApiKey.done')}</DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
