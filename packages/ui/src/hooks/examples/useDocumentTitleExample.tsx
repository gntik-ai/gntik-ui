import { useState } from 'react';
import { Button } from '../../components/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { useDocumentTitle } from '../index';

function EditingTitle() {
  const { t } = useI18n();
  const title = t('hooksExample.documentTitle.edit');
  useDocumentTitle(title);
  return <p>{t('hooksExample.documentTitle.current', { value: title })}</p>;
}

export default function DocumentTitleExample() {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-foreground">
      <Button variant="secondary" aria-pressed={editing} onClick={() => setEditing((value) => !value)}>
        {t(editing ? 'hooksExample.documentTitle.stop' : 'hooksExample.documentTitle.edit')}
      </Button>
      {editing && <EditingTitle />}
      <p className="text-muted-foreground">{t('hooksExample.documentTitle.hint')}</p>
    </div>
  );
}
