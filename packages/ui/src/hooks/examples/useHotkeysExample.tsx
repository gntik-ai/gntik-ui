import { useRef, useState } from 'react';
import { CommandPalette, CommandPaletteTrigger } from '../../components/CommandPalette';
import { Input } from '../../components/Input';
import { KbdCombo } from '../../components/Kbd';
import { useI18n } from '../../i18n';
import { useHotkeys, useRegisteredHotkeys } from '../useHotkeys';

export default function HotkeysExample() {
  const { t } = useI18n();
  const search = useRef<HTMLInputElement>(null);
  const [lastKeys, setLastKeys] = useState<string[]>([]);
  useHotkeys({
    '/': () => search.current?.focus(),
    'g d': () => setLastKeys(['G', 'D']),
    'alt+p': () => setLastKeys(['Alt', 'P']),
  });
  const registered = useRegisteredHotkeys();
  return (
    <div className="flex flex-col gap-4 text-sm text-foreground">
      <Input ref={search} aria-label={t('common.search')} placeholder={t('common.searchPlaceholder')} />
      <CommandPalette groups={[]}>
        <CommandPaletteTrigger />
      </CommandPalette>
      <ul className="flex flex-col gap-2">
        {registered.map((entry, index) => (
          <li key={`${entry.hotkey}-${index}`} className="flex items-center gap-2">
            <KbdCombo keys={entry.keys} />
            {entry.then && <KbdCombo keys={entry.then} />}
            {entry.description}
          </li>
        ))}
      </ul>
      <output aria-live="polite">
        <KbdCombo keys={lastKeys} />
      </output>
    </div>
  );
}
