import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../Dialog';
import { FileTrigger } from '../FileTrigger';

export default function FileInputTrigger() {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FileTrigger accept=".yaml" onSelect={setFiles}>
        {t('fileInput.example.import')}
      </FileTrigger>
      <FileTrigger
        accept=".yaml"
        onSelect={setFiles}
        render={<span className="rounded-md border border-border px-3 py-2 text-sm text-foreground focus-ring" />}
      >
        {t('fileInput.choose')}
      </FileTrigger>
      <Dialog>
        <DialogTrigger render={<Button variant="secondary" />}>{t('fileInput.example.dialog')}</DialogTrigger>
        <DialogContent>
          <DialogTitle>{t('fileInput.example.import')}</DialogTitle>
          <FileTrigger accept=".yaml" onSelect={setFiles} render={<Button variant="secondary" />}>
            {t('fileInput.example.import')}
          </FileTrigger>
        </DialogContent>
      </Dialog>
      <span role="status" className="text-sm text-muted-foreground">
        {files.map((file) => file.name).join(', ')}
      </span>
    </div>
  );
}
