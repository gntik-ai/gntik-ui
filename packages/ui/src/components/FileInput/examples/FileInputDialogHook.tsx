import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { useFileDialog } from '../useFileDialog';

export default function FileInputDialogHook() {
  const { t } = useI18n();
  const { open, reset, files } = useFileDialog({ multiple: true });
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={open}>
        {t('fileInput.chooseMany')}
      </Button>
      <Button variant="ghost" onClick={reset}>
        {t('fileInput.example.reset')}
      </Button>
      <span role="status" className="text-sm text-muted-foreground">
        {t('fileInput.count', { count: files.length })}
      </span>
    </div>
  );
}
