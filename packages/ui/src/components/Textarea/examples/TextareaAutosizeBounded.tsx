import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Textarea } from '../Textarea';

export default function TextareaAutosizeBounded() {
  const { t } = useI18n();
  const [medium, setMedium] = useState('');
  const [small, setSmall] = useState('');
  return (
    <div className="grid max-w-3xl gap-4" data-textarea-autosize-bounded>
      <Field>
        <FieldLabel>{t('textarea.prompt')}</FieldLabel>
        <Textarea autosize minRows={3} maxRows={12} placeholder={t('textarea.placeholder')} />
        <FieldDescription>{t('textarea.boundsHint')}</FieldDescription>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>{t('textarea.mediumPrompt')}</FieldLabel>
          <Textarea autosize size="md" minRows={2} maxRows={6} value={medium} onValueChange={setMedium} />
        </Field>
        <Field>
          <FieldLabel>{t('textarea.smallPrompt')}</FieldLabel>
          <Textarea autosize size="sm" minRows={2} maxRows={6} value={small} onValueChange={setSmall} />
        </Field>
      </div>
      <Button
        variant="secondary"
        onClick={() => {
          const prompt = Array(20).fill(t('textarea.sampleLine')).join('\n');
          setMedium(prompt);
          setSmall(prompt);
        }}
      >
        {t('textarea.replace')}
      </Button>
    </div>
  );
}
