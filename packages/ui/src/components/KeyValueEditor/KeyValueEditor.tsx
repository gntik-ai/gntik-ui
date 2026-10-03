import { ClipboardPaste, Lock, LockOpen, Plus, Trash2 } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ClipboardEvent } from 'react';
import type { MessageKey } from '../../i18n';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button, IconButton } from '../Button';
import { CopyButton } from '../CopyButton';
import { Input } from '../Input';
import { LiveAnnouncer, useAnnounce, useHasLiveAnnouncer } from '../LiveAnnouncer';
import { PasswordInput } from '../PasswordInput';
import { Textarea } from '../Textarea';
import {
  createKeyValueRow,
  mergeEnvRows,
  parseEnv,
  serializeEnv,
  validateKeyValueRows,
  type KeyValueErrorCode,
  type KeyValueErrors,
  type KeyValueRow,
  type ValidateKeyValueOptions,
} from './key-value';
import { keyValueEditorVariants } from './key-value-editor.variants';

const ERROR_KEY: Record<KeyValueErrorCode, MessageKey> = {
  duplicate: 'kv.errDuplicate',
  pattern: 'kv.errPattern',
  keyRequired: 'kv.errKeyRequired',
  valueRequired: 'kv.errValueRequired',
};

export interface KeyValueEditorProps extends ValidateKeyValueOptions {
  /** Rows (controlled). */
  value?: KeyValueRow[];
  /** Initial rows (uncontrolled). */
  defaultValue?: KeyValueRow[];
  onChange?: (rows: KeyValueRow[]) => void;
  /** Called with whether every row is valid, and the per-row errors, whenever they change. */
  onValidityChange?: (valid: boolean, errors: KeyValueErrors) => void;
  /** Extra per-row error message (shown under the value), after the built-in checks. */
  validate?: (row: KeyValueRow, rows: readonly KeyValueRow[]) => string | undefined;
  /** Show the per-row "secret" toggle (default true). */
  allowSecrets?: boolean;
  /** Show "Paste .env" and accept multi-line paste in key fields (default true). */
  allowPaste?: boolean;
  /** Show "Copy as .env" (default true). */
  allowExport?: boolean;
  /** Maximum number of rows; Add and import stop there. */
  maxRows?: number;
  readOnly?: boolean;
  disabled?: boolean;
  size?: 'auto' | 'sm' | 'md';
  /** Names the editor (role="group"). */
  'aria-label'?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  className?: string;
}

/**
 * Editable list of key/value rows (environment variables, headers, labels). Add and remove
 * rows (no reordering), per-row validation (required, key pattern, duplicates, custom), secret
 * rows with masked values, bulk paste of `.env` text and export as `.env`. Controlled or not.
 */
export function KeyValueEditor(props: KeyValueEditorProps) {
  // Without an announcer above, provide one so this field and its CopyButton share one status region.
  return useHasLiveAnnouncer() ? <KeyValueEditorInner {...props} /> : (
    <LiveAnnouncer>
      <KeyValueEditorInner {...props} />
    </LiveAnnouncer>
  );
}

function KeyValueEditorInner({
  value,
  defaultValue,
  onChange,
  onValidityChange,
  validate,
  keyPattern,
  requireValue,
  caseInsensitive,
  allowSecrets = true,
  allowPaste = true,
  allowExport = true,
  maxRows = Infinity,
  readOnly = false,
  disabled = false,
  size = 'auto',
  'aria-label': ariaLabel,
  keyPlaceholder = 'KEY',
  valuePlaceholder,
  className,
}: KeyValueEditorProps) {
  const { t } = useI18n();
  const announce = useAnnounce();
  const baseId = useId();
  const [inner, setInner] = useState<KeyValueRow[]>(() => defaultValue ?? [createKeyValueRow()]);
  const rows = value ?? inner;
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const focusTarget = useRef<string | null>(null);
  const keyRefs = useRef(new Map<string, HTMLInputElement>());
  const addRef = useRef<HTMLButtonElement>(null);
  const pasteRef = useRef<HTMLButtonElement>(null);
  const s = keyValueEditorVariants({ size });
  const editable = !readOnly && !disabled;
  const atMax = rows.length >= maxRows;

  const errors = useMemo(() => validateKeyValueRows(rows, { keyPattern, requireValue, caseInsensitive }), [rows, keyPattern, requireValue, caseInsensitive]);
  const custom = useMemo(() => {
    const out: Record<string, string> = {};
    if (validate) for (const row of rows) {
      const message = validate(row, rows);
      if (message) out[row.id] = message;
    }
    return out;
  }, [rows, validate]);
  const valid = Object.keys(errors).length === 0 && Object.keys(custom).length === 0;
  const errorsKey = JSON.stringify([errors, custom]);
  const validityRef = useRef(onValidityChange);
  useEffect(() => {
    validityRef.current = onValidityChange;
  });
  useEffect(() => {
    validityRef.current?.(valid, errors);
    // errorsKey captures the content of `errors` so new-but-equal objects do not re-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, errorsKey]);

  // Focus requested by add / remove / paste lands once the new rows are rendered.
  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    focusTarget.current = null;
    if (target === '@add') addRef.current?.focus();
    else if (target === '@paste') pasteRef.current?.focus();
    else keyRefs.current.get(target)?.focus();
  });
  const setFocusTarget = (target: string) => {
    focusTarget.current = target;
  };


  const commit = (next: KeyValueRow[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const update = (id: string, patch: Partial<KeyValueRow>) => commit(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const add = () => {
    if (atMax) return;
    const row = createKeyValueRow();
    commit([...rows, row]);
    setFocusTarget(row.id);
  };

  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    commit(next);
    const neighbour = next[index] ?? next[index - 1];
    setFocusTarget(neighbour ? neighbour.id : '@add');
    announce(t('kv.rowRemoved'));
  };

  const importText = (text: string) => {
    const pairs = parseEnv(text);
    if (!pairs.length) return 0;
    const merged = mergeEnvRows(rows, pairs).slice(0, Math.max(maxRows, 0));
    commit(merged);
    announce(t('kv.imported', { count: pairs.length }));
    return pairs.length;
  };

  const onKeyPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!allowPaste) return;
    const text = event.clipboardData.getData('text');
    if (!/\r?\n/.test(text.trim()) || !text.includes('=')) return;
    event.preventDefault();
    importText(text);
  };

  const submitPaste = () => {
    if (importText(pasteText) > 0) {
      setPasteText('');
      setPasteOpen(false);
      setFocusTarget('@paste');
    }
  };

  const pasteId = `${baseId}-paste`;
  const pasteHintId = `${baseId}-paste-hint`;

  return (
    <div role="group" aria-label={ariaLabel} className={cn(s.root(), className)}>
      {rows.length > 0 ? (
        <>
          <div className={s.header()} aria-hidden>
            <span>{t('kv.key')}</span>
            <span>{t('kv.value')}</span>
            <span className={s.headerSpacer()} />
          </div>
          <ul className={s.list()}>
            {rows.map((row, index) => {
              const n = index + 1;
              const err = errors[row.id];
              const keyErrId = `${baseId}-${row.id}-kerr`;
              const valErrId = `${baseId}-${row.id}-verr`;
              const valueMessage = err?.value ? t(ERROR_KEY[err.value]) : custom[row.id];
              const valueProps = {
                'aria-label': row.secret ? t('kv.secretRow', { row: n }) : t('kv.valueRow', { row: n }),
                value: row.value,
                onValueChange: (v: string) => update(row.id, { value: v }),
                placeholder: valuePlaceholder,
                size,
                disabled,
                readOnly,
                invalid: Boolean(valueMessage),
                inputClassName: s.valueInput(),
                autoComplete: 'off',
                spellCheck: false,
                ...(valueMessage ? { 'aria-describedby': valErrId } : {}),
              } as const;
              return (
                <li key={row.id} className={s.row()} data-row={n}>
                  <div className={s.cell()}>
                    <Input
                      ref={(el) => {
                        if (el) keyRefs.current.set(row.id, el);
                        else keyRefs.current.delete(row.id);
                      }}
                      aria-label={t('kv.keyRow', { row: n })}
                      value={row.key}
                      onValueChange={(v) => update(row.id, { key: v })}
                      onPaste={onKeyPaste}
                      placeholder={keyPlaceholder}
                      size={size}
                      disabled={disabled}
                      readOnly={readOnly}
                      invalid={Boolean(err?.key)}
                      inputClassName={s.keyInput()}
                      autoComplete="off"
                      spellCheck={false}
                      {...(err?.key ? { 'aria-describedby': keyErrId } : {})}
                    />
                    {err?.key && (
                      <p id={keyErrId} className={s.error()}>
                        {t(ERROR_KEY[err.key])}
                      </p>
                    )}
                  </div>
                  <div className={s.cell()}>
                    {row.secret ? <PasswordInput {...valueProps} /> : <Input {...valueProps} />}
                    {valueMessage && (
                      <p id={valErrId} className={s.error()}>
                        {valueMessage}
                      </p>
                    )}
                  </div>
                  <div className={s.rowActions()}>
                    {allowSecrets && (
                      <IconButton
                        size="sm"
                        icon={row.secret ? Lock : LockOpen}
                        label={t('kv.secretRow', { row: n })}
                        aria-pressed={Boolean(row.secret)}
                        disabled={!editable}
                        onClick={() => update(row.id, { secret: !row.secret })}
                      />
                    )}
                    {editable && <IconButton size="sm" icon={Trash2} label={t('kv.removeRow', { row: n })} onClick={() => remove(index)} />}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className={s.empty()}>{t('kv.empty')}</p>
      )}

      {pasteOpen && editable && (
        <div className={s.paste()}>
          <label htmlFor={pasteId} className={s.pasteLabel()}>
            {t('kv.pasteLabel')}
          </label>
          <Textarea
            id={pasteId}
            aria-describedby={pasteHintId}
            value={pasteText}
            onValueChange={setPasteText}
            rows={5}
            spellCheck={false}
            placeholder={'API_URL=https://api.example.com\n# comment\nLOG_LEVEL=info'}
            className="font-mono text-[12.5px]"
            autoFocus
          />
          <p id={pasteHintId} className={s.pasteHint()}>
            {t('kv.pasteHint')}
          </p>
          <div className={s.pasteActions()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPasteOpen(false);
                setFocusTarget('@paste');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={submitPaste} disabled={!pasteText.trim()}>
              {t('kv.import')}
            </Button>
          </div>
        </div>
      )}

      {(editable || allowExport) && (
        <div className={s.footer()}>
          {editable && (
            <Button ref={addRef} variant="secondary" size="sm" icon={Plus} onClick={add} disabled={atMax}>
              {t('kv.add')}
            </Button>
          )}
          {editable && allowPaste && (
            <Button ref={pasteRef} variant="ghost" size="sm" icon={ClipboardPaste} aria-expanded={pasteOpen} onClick={() => setPasteOpen((o) => !o)}>
              {t('kv.paste')}
            </Button>
          )}
          {allowExport && (
            <span className={s.footerEnd()}>
              <CopyButton display="label" size="sm" variant="ghost" label={t('kv.copyEnv')} value={() => serializeEnv(rows)} disabled={!rows.some((r) => r.key.trim())} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
