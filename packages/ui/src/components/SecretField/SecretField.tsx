import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useId, useState, type Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../AlertDialog';
import { Button, IconButton } from '../Button';
import { CopyButton } from '../CopyButton';
import { Input, type InputProps } from '../Input';
import { LiveAnnouncer, useAnnounce, useHasLiveAnnouncer } from '../LiveAnnouncer';
import { Timestamp } from '../Timestamp';
import { maskSecret, type MaskOptions } from './secret-mask';
import { secretFieldVariants } from './secret-field.variants';

type DateInput = Date | number | string;

export interface SecretFieldProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'type' | 'readOnly' | 'trailingAddon' | 'title' | 'onValueChange'>,
    MaskOptions {
  ref?: Ref<HTMLInputElement>;
  /** The secret. While hidden and read-only it is not rendered into the DOM at all. */
  value: string;
  /** Allow editing (renders a password input). Read-only by default. */
  editable?: boolean;
  onValueChange?: (value: string) => void;
  /** Whether the value is shown (controlled). */
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
  /** Show the copy button (default true). Copies the real value even while masked. */
  copyable?: boolean;
  /** Adds a Rotate action. Return a promise to show a loading state until it settles. */
  onRotate?: () => void | Promise<void>;
  /** Ask for confirmation before rotating (default true). */
  confirmRotate?: boolean;
  /** Overrides for the rotate button and its confirmation. */
  rotateLabel?: string;
  rotateTitle?: string;
  rotateDescription?: string;
  rotateConfirmLabel?: string;
  /** When the secret was created. */
  createdAt?: DateInput;
  /** When it was last used; `null` renders "Never used". */
  lastUsedAt?: DateInput | null;
  /** Classes for the outer column (`className` goes on the field). */
  wrapperClassName?: string;
}

/**
 * A secret value (API key, token, connection string): masked by default with a reveal toggle
 * (aria-pressed), a copy button that announces "Copied", an optional Rotate action behind a
 * confirmation, and optional created / last-used meta. Read-only unless `editable`. The secret
 * never goes into a title or tooltip, and while masked and read-only it is not in the DOM.
 */
export function SecretField(props: SecretFieldProps) {
  // Without an announcer above, provide one so this field and its CopyButton share one status region.
  return useHasLiveAnnouncer() ? <SecretFieldInner {...props} /> : (
    <LiveAnnouncer>
      <SecretFieldInner {...props} />
    </LiveAnnouncer>
  );
}

function SecretFieldInner({
  value,
  editable = false,
  onValueChange,
  revealed: revealedProp,
  defaultRevealed = false,
  onRevealedChange,
  copyable = true,
  onRotate,
  confirmRotate = true,
  rotateLabel,
  rotateTitle,
  rotateDescription,
  rotateConfirmLabel,
  createdAt,
  lastUsedAt,
  visiblePrefix,
  visibleSuffix,
  maskLength,
  size = 'auto',
  disabled,
  className,
  inputClassName,
  wrapperClassName,
  'aria-describedby': describedBy,
  ...props
}: SecretFieldProps) {
  const { t } = useI18n();
  const announce = useAnnounce();
  const hiddenId = useId();
  const metaId = useId();
  const [innerRevealed, setInnerRevealed] = useState(defaultRevealed);
  const [rotating, setRotating] = useState(false);
  const revealed = revealedProp ?? innerRevealed;
  const s = secretFieldVariants({ size });
  const hasMeta = createdAt !== undefined || lastUsedAt !== undefined;

  const toggle = () => {
    setInnerRevealed(!revealed);
    onRevealedChange?.(!revealed);
  };


  const rotate = async () => {
    if (!onRotate) return;
    setRotating(true);
    try {
      await onRotate();
      announce(t('secret.rotated'));
    } catch {
      announce(t('secret.rotateFailed'), 'assertive');
    } finally {
      setRotating(false);
    }
  };

  const masked = !revealed;
  const shown = editable ? value : masked ? maskSecret(value, { visiblePrefix, visibleSuffix, maskLength }) : value;
  const describedByIds = cn(describedBy, masked && !editable && value && hiddenId, hasMeta && metaId) || undefined;
  const rotateText = rotateLabel ?? t('secret.rotate');

  return (
    <div className={cn(s.root(), wrapperClassName)}>
      <div className={s.row()}>
        <Input
          {...props}
          size={size}
          disabled={disabled}
          className={cn(s.field(), className)}
          inputClassName={cn(s.input(), inputClassName)}
          type={editable && masked ? 'password' : 'text'}
          readOnly={!editable}
          value={shown}
          onValueChange={editable ? (v) => onValueChange?.(v) : undefined}
          autoComplete="off"
          spellCheck={false}
          data-masked={masked || undefined}
          aria-describedby={describedByIds}
          trailingAddon={
            <span className={s.actions()}>
              <IconButton
                size="sm"
                className={s.toggle()}
                icon={revealed ? EyeOff : Eye}
                label={revealed ? t('secret.hide') : t('secret.show')}
                aria-pressed={revealed}
                disabled={disabled}
                onClick={toggle}
              />
              {copyable && (
                <CopyButton
                  size="sm"
                  className={s.toggle()}
                  value={() => value}
                  label={t('secret.copy')}
                  announcement={t('secret.copied')}
                  disabled={disabled || !value}
                />
              )}
            </span>
          }
        />
        {onRotate &&
          (confirmRotate ? (
            <AlertDialog>
              <AlertDialogTrigger
                disabled={disabled || rotating}
                render={
                  <Button variant="secondary" size={size} icon={RefreshCw} loading={rotating}>
                    {rotateText}
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader tone="warning">
                  <AlertDialogTitle>{rotateTitle ?? t('secret.rotateTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{rotateDescription ?? t('secret.rotateDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction variant="primary" icon={RefreshCw} onClick={rotate}>
                    {rotateConfirmLabel ?? t('secret.rotateConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="secondary" size={size} icon={RefreshCw} loading={rotating} disabled={disabled} onClick={rotate}>
              {rotateText}
            </Button>
          ))}
      </div>
      {masked && !editable && value && (
        <span id={hiddenId} className="sr-only">
          {t('secret.hidden')}
        </span>
      )}
      {hasMeta && (
        <p id={metaId} className={s.meta()}>
          {createdAt !== undefined && (
            <span className={s.metaItem()}>
              {t('secret.created')} <Timestamp value={createdAt} tooltip={false} />
            </span>
          )}
          {lastUsedAt !== undefined && (
            <span className={s.metaItem()}>
              {lastUsedAt === null ? t('secret.neverUsed') : <>{t('secret.lastUsed')} <Timestamp value={lastUsedAt} tooltip={false} /></>}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
