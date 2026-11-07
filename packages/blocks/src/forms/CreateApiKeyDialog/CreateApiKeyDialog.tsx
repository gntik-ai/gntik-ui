import {
  useI18n,
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  CodeBlock,
  DialogClose,
  Field,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetLegend,
  FormDialog,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@gntik-ai/ui';
import { KeyRound } from '@gntik-ai/icons';
import { Children, cloneElement, useState, type ReactElement, type ReactNode } from 'react';
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
  open,
  defaultOpen = false,
  onOpenChange,
  trigger = <Button icon={KeyRound} />,
}: CreateApiKeyDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [expiry, setExpiry] = useState(defaultExpiry);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const nameInvalid = submitted && name.trim() === '';
  const scopesInvalid = submitted && selected.length === 0;
  const formTitle = labels?.title ?? t('createApiKey.title');

  // Reset runs once the dialog has closed, so the secret stays until the exit animation ends.
  const reset = () => {
    setName('');
    setSelected([]);
    setExpiry(defaultExpiry);
    setSubmitted(false);
    setError(null);
    setSecret(null);
  };

  const create = async () => {
    try {
      setSecret(await onCreate({ name: name.trim(), scopes: selected, expiry }));
    } catch (e) {
      setError(e instanceof Error ? e.message : (labels?.fallbackError ?? t('createApiKey.fallbackError')));
    }
    return false;
  };

  const submit = () => {
    // The secret step has nothing to submit: a second submit must never mint another key.
    if (secret != null) return false;
    setSubmitted(true);
    setError(null);
    if (name.trim() === '' || selected.length === 0) return false;
    return create();
  };

  // The title swaps on the secret step, but the trigger keeps naming the action that opens the dialog.
  const triggerHasChildren =
    trigger != null && Children.count((trigger.props as { children?: ReactNode }).children) > 0;
  const labelledTrigger = trigger == null || triggerHasChildren ? trigger : cloneElement(trigger, undefined, formTitle);

  return (
    <FormDialog
      size="lg"
      title={secret == null ? formTitle : (labels?.successTitle ?? t('createApiKey.successTitle'))}
      description={
        secret == null
          ? (labels?.description ?? t('createApiKey.description'))
          : (labels?.successDescription ?? t('createApiKey.successDescription'))
      }
      trigger={labelledTrigger ?? undefined}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      onClosed={reset}
      cancelLabel={labels?.cancel ?? t('createApiKey.cancel')}
      submitLabel={labels?.submit ?? t('createApiKey.submit')}
      footer={
        secret == null ? undefined : (
          <DialogClose render={<Button />}>{labels?.done ?? t('createApiKey.done')}</DialogClose>
        )
      }
      summary={
        error && (
          <Alert tone="destructive" title={labels?.errorTitle ?? t('createApiKey.errorTitle')} description={error} />
        )
      }
    >
      {secret == null ? (
        <>
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
        </>
      ) : (
        <>
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
        </>
      )}
    </FormDialog>
  );
}
