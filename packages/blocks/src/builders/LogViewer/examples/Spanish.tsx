import { I18nProvider, Stack, en } from '@gntik-ai/ui';
import { LogViewer } from '../LogViewer';
import { makeLogLines } from '../fixtures';
const lines = makeLogLines(3);
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <Stack gap={6}>
        <LogViewer lines={lines} height={100} onSelectLine={() => {}} />
        <LogViewer
          lines={lines}
          height={100}
          onSelectLine={() => {}}
          labels={{
            copyFailed: en['common.copyFailed'],
            title: 'Application logs',
            levelFilter: 'Severity',
            searchLabel: 'Find log messages',
            searchPlaceholder: 'Find…',
            follow: 'Follow stream',
            count: (visible, total) => `${visible}/${total} lines`,
            empty: 'Nothing matched',
            inspect: (timestamp) => `Open ${timestamp}`,
            copy: (timestamp) => `Copy ${timestamp}`,
            copied: 'Line copied',
          }}
        />
      </Stack>
    </I18nProvider>
  );
}
