import { Field, FieldDescription, FieldLabel } from '../../Field';
import { useI18n } from '../../../i18n';
import { Textarea } from '../Textarea';

const countBytes = (value: string) => new TextEncoder().encode(value).length;

export default function TextareaCounter() {
  const { t } = useI18n();
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Field>
        <FieldLabel>{t('charCount.noteLabel')}</FieldLabel>
        <Textarea showCount maxLength={280} clearable defaultValue={t('charCount.noteExample')} />
        <FieldDescription>{t('charCount.noteHint')}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{t('charCount.bytesLabel')}</FieldLabel>
        <Textarea showCount maxCount={10} countStrategy={countBytes} defaultValue="é" clearable />
        <FieldDescription>{t('charCount.bytesHint')}</FieldDescription>
      </Field>
    </div>
  );
}
