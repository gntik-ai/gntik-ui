import { Button, cn, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface StickyActionBarProps {
  /** Whether the form has unsaved changes; Save and Discard are disabled while clean. */
  dirty?: boolean;
  /** Shows a spinner on Save and blocks both buttons. */
  saving?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  /** Text while dirty. */
  dirtyMessage?: ReactNode;
  /** Text while clean. */
  cleanMessage?: ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  /** Render nothing while clean (the bar slides in only when there is something to save). */
  hideWhenClean?: boolean;
  /** Accessible name of the region. */
  'aria-label'?: string;
  className?: string;
}

/** Bottom bar for long forms: unsaved-changes status plus Discard / Save, sticky to the viewport. */
export function StickyActionBar({
  dirty = true,
  saving = false,
  onSave,
  onCancel,
  dirtyMessage: dirtyMessageProp,
  cleanMessage: cleanMessageProp,
  saveLabel: saveLabelProp,
  cancelLabel: cancelLabelProp,
  hideWhenClean = false,
  'aria-label': ariaLabelProp,
  className,
}: StickyActionBarProps) {
  const { t } = useI18n();
  const dirtyMessage = dirtyMessageProp ?? t('actionBar.unsaved');
  const cleanMessage = cleanMessageProp ?? t('actionBar.saved');
  const saveLabel = saveLabelProp ?? t('actionBar.save');
  const cancelLabel = cancelLabelProp ?? t('actionBar.discard');
  const ariaLabel = ariaLabelProp ?? t('actionBar.save');
  if (hideWhenClean && !dirty && !saving) return null;
  return (
    <section
      aria-label={ariaLabel}
      className={cn('sticky bottom-0 z-20 border-t border-border bg-card px-4 py-3 shadow-sm sm:px-6', className)}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="flex items-center gap-2 text-[13px] text-foreground">
          <span aria-hidden className={cn('size-2 shrink-0 rounded-full', dirty ? 'bg-warning' : 'bg-success')} />
          {saving ? t('actionBar.saving') : dirty ? dirtyMessage : cleanMessage}
        </p>
        <div className="flex items-center gap-2 sm:justify-end [&>*]:flex-1 sm:[&>*]:flex-none">
          <Button variant="ghost" disabled={!dirty || saving} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" loading={saving} disabled={!dirty} onClick={onSave}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
