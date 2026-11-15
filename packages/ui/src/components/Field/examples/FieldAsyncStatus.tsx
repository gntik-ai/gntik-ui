import { useState } from 'react';
import { Field, FieldError, FieldLabel, FieldSuccess, FieldWarning, useFieldStatus, type FieldStatus } from '../Field';
import { Input } from '../../Input';
import { NumberInput } from '../../NumberInput';
import { Checkbox } from '../../Checkbox';
import { Button } from '../../Button';
import { useI18n } from '../../../i18n';

function CustomStatus() {
  const { status } = useFieldStatus();
  const { t } = useI18n();
  const text = status === 'warning' ? t('fieldStatus.warningStatus') : t(`fieldStatus.${status}`);
  return (
    <span className="text-[12px] text-muted-foreground">
      {t('fieldStatus.custom')}: {text}
    </span>
  );
}

/** Manual statuses also work for custom controls through useFieldStatus. */
export default function FieldAsyncStatus() {
  const { t } = useI18n();
  const [status, setStatus] = useState<FieldStatus>('idle');
  const [feedbackIcon, setFeedbackIcon] = useState(true);
  const [hideIcon, setHideIcon] = useState(false);
  const [match, setMatch] = useState(false);
  return (
    <div className="grid max-w-md gap-5" data-field-status-example="">
      <div className="flex flex-wrap gap-2">
        {(['idle', 'validating', 'success', 'warning'] as const).map((value) => (
          <Button key={value} variant="secondary" onClick={() => setStatus(value)}>
            {value === 'warning' ? t('fieldStatus.warningStatus') : t(`fieldStatus.${value}`)}
          </Button>
        ))}
      </div>
      <Checkbox checked={feedbackIcon} onCheckedChange={setFeedbackIcon} label={t('fieldStatus.feedback')} />
      <Checkbox checked={hideIcon} onCheckedChange={setHideIcon} label={t('fieldStatus.hideIcon')} />
      <Checkbox checked={match} onCheckedChange={setMatch} label={t('fieldStatus.match')} />
      <Field status={status} feedbackIcon={feedbackIcon}>
        <FieldLabel>{t('fieldStatus.slug')}</FieldLabel>
        <Input defaultValue="workspace" />
        <FieldWarning hideIcon={hideIcon} match={match || undefined}>
          {t('fieldStatus.warning')}
        </FieldWarning>
        <FieldSuccess hideIcon={hideIcon}>{t('fieldStatus.available')}</FieldSuccess>
        <CustomStatus />
      </Field>
      <Field status={status} feedbackIcon={feedbackIcon}>
        <FieldLabel>{t('fieldStatus.limit')}</FieldLabel>
        <NumberInput defaultValue={9} />
        <FieldWarning hideIcon={hideIcon}>{t('fieldStatus.warning')}</FieldWarning>
      </Field>
      <Field invalid status="success" feedbackIcon={feedbackIcon}>
        <FieldLabel>{t('fieldStatus.slug')}</FieldLabel>
        <Input defaultValue="taken" />
        <FieldError hideIcon={hideIcon}>{t('fieldStatus.taken')}</FieldError>
        <FieldSuccess>{t('fieldStatus.available')}</FieldSuccess>
        <CustomStatus />
      </Field>
    </div>
  );
}
