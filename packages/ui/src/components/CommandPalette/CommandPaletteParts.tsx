import { Autocomplete } from '@base-ui/react/autocomplete';
import { ArrowRight, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { RTL_FLIP } from '../../utils/rtl';
import { Kbd, KbdCombo } from '../Kbd';
import { commandPaletteVariants } from './command-palette.variants';
import type { CommandEntry, CommandItem } from './command-filter';
import { isRetryEntry } from './commandPaletteAsync';

const s = commandPaletteVariants();

export function CommandRow({
  entry,
  onActivate,
  renderItem,
}: {
  entry: CommandEntry;
  onActivate: (entry: CommandEntry) => void;
  renderItem?: (item: CommandItem) => ReactNode;
}) {
  const { t } = useI18n();
  const { item } = entry;
  const v = commandPaletteVariants({ mono: item.mono });
  const IconCmp = item.icon;
  if (isRetryEntry(entry)) {
    return (
      <Autocomplete.Item value={entry} onClick={() => onActivate(entry)} className={v.item({ class: 'font-medium' })}>
        <RotateCw size={14} aria-hidden className={v.itemIcon()} />
        <span className={v.itemText()}>
          <span className={v.itemLabel()}>{t('common.retry')}</span>
        </span>
      </Autocomplete.Item>
    );
  }
  return (
    <Autocomplete.Item value={entry} disabled={item.disabled} onClick={() => onActivate(entry)} className={v.item()}>
      {renderItem ? (
        renderItem(item)
      ) : (
        <>
          {IconCmp && <IconCmp size={16} aria-hidden className={v.itemIcon()} />}
          <span className={v.itemText()}>
            <span className={v.itemLabel()}>{item.label}</span>
            {item.description && (
              <span className={v.itemDescription({ class: 'group-data-highlighted:text-accent-foreground' })}>
                {item.description}
              </span>
            )}
          </span>
          {item.shortcut?.length ? (
            <KbdCombo size="sm" keys={item.shortcut} />
          ) : (
            <ArrowRight size={14} aria-hidden className={cn(v.itemArrow(), RTL_FLIP)} />
          )}
        </>
      )}
    </Autocomplete.Item>
  );
}

export function DefaultFooter({ count, total, id }: { count: number; total: number; id: string }) {
  const { t } = useI18n();
  return (
    <div className={s.footer()}>
      <span id={id} className={s.hint()}>
        <Kbd size="sm">↑↓</Kbd>
        {t('commandPalette.navigate')}
        <span className="sr-only">,</span>
      </span>
      <span className={s.hint()}>
        <Kbd size="sm">↵</Kbd>
        {t('commandPalette.run')}
      </span>
      <span className={s.hint()}>
        <Kbd size="sm">esc</Kbd>
        {t('commandPalette.close')}
      </span>
      <span className={s.count()} aria-live="polite">
        {total > count ? t('commandPalette.showing', { shown: count, total }) : t('common.results', { count })}
      </span>
    </div>
  );
}
