import { useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button/Button';
import { Input } from '../../Input/Input';
import { useInlineEdit } from '../useInlineEdit';

/** A low-level editor with explicit Save/Cancel actions. */
export default function LowLevel() {
  const { t } = useI18n();
  const [value, setValue] = useState(t('editableText.example.supportAgent'));
  const trigger = useRef<HTMLButtonElement>(null);
  const state = useInlineEdit({
    value,
    parse: (draft) => ({ ok: true, value: draft.trim() }),
    genericError: t('editableText.saveFailed'),
    onSave: (next) => setValue(next),
    onMove: () => trigger.current?.focus(),
  });
  return state.editing ? (
    <div className="flex items-center gap-2">
      <Input
        aria-label={t('editableText.example.agentName')}
        value={state.draft}
        onValueChange={state.setDraft}
        readOnly={state.pending}
        aria-busy={state.pending || undefined}
      />
      <Button onClick={() => void state.commit()}>{t('editableText.example.save')}</Button>
      <Button variant="ghost" onClick={() => state.cancel()}>
        {t('editableText.example.cancel')}
      </Button>
    </div>
  ) : (
    <Button ref={trigger} variant="ghost" onClick={state.start}>
      {value}
    </Button>
  );
}
