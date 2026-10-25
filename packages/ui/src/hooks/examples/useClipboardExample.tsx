import { Copy } from 'lucide-react';
import { Button } from '../../components/Button';
import { LiveAnnouncer } from '../../components/LiveAnnouncer';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../../components/Menu';
import { useI18n } from '../../i18n/I18nProvider';
import { useClipboard } from '../useClipboard';

function ClipboardRow() {
  const { t } = useI18n();
  const { copy } = useClipboard({ announce: true });
  return (
    <div className="flex items-center justify-between gap-6 rounded-md border border-border bg-card p-4 text-foreground">
      <code className="text-sm">run_42</code>
      <Menu>
        <MenuTrigger render={<Button variant="secondary" />}>{t('common.moreActions')}</MenuTrigger>
        <MenuContent>
          <MenuItem icon={Copy} onClick={() => void copy('run_42')}>
            {t('descriptionList.copy', { label: 'ID' })}
          </MenuItem>
          <MenuItem
            icon={Copy}
            onClick={() => void copy(() => Promise.resolve('curl https://example.com/runs/run_42'))}
          >
            {t('kv.copyEnv').replace('.env', 'cURL')}
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

export default function ClipboardExample() {
  return (
    <LiveAnnouncer>
      <ClipboardRow />
    </LiveAnnouncer>
  );
}
