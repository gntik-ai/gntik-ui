import { KbdCombo } from '../../components/Kbd';
import { useI18n } from '../../i18n/I18nProvider';
import { useHotkeys, useRegisteredHotkeys } from '../useHotkeys';

export default function RegisteredHotkeysExample() {
  const { t } = useI18n();
  useHotkeys({
    'g d': { handler: () => undefined, description: t('hooksExample.registeredHotkeys.dashboard') },
    'alt+n': { handler: () => undefined, description: t('hooksExample.registeredHotkeys.newItem') },
  });
  const registered = useRegisteredHotkeys();
  return (
    <div className="flex flex-col gap-3 text-sm text-foreground">
      <p className="text-muted-foreground">{t('hooksExample.hotkeys.registered', { count: registered.length })}</p>
      <ul className="flex flex-col gap-2">
        {registered.map((entry, index) => (
          <li key={`${entry.hotkey}-${index}`} className="flex items-center gap-2">
            <KbdCombo keys={entry.keys} />
            {entry.then && <KbdCombo keys={entry.then} />}
            {entry.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
