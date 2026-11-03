import { Button } from '../../components/Button';
import { Toaster, ToastProvider } from '../../components/Toast';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../index';

function ShowToast() {
  const { t } = useI18n();
  const toast = useToast();
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-foreground">
      <Button
        onClick={() =>
          toast.add({
            title: t('hooksExample.toast.title'),
            description: t('hooksExample.toast.description'),
            tone: 'success',
          })
        }
      >
        {t('hooksExample.toast.show')}
      </Button>
      <p>{t('hooksExample.toast.count', { count: toast.toasts.length })}</p>
    </div>
  );
}

export default function ToastHookExample() {
  return (
    <ToastProvider>
      <ShowToast />
      <Toaster />
    </ToastProvider>
  );
}
