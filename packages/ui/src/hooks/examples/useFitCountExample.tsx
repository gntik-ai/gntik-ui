import { useRef } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useFitCount } from '../index';

const TAGS = ['Design', 'Frontend', 'Accessibility', 'Release', 'Documentation', 'Infrastructure'];
const chip = 'whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-foreground';

export default function FitCountExample() {
  const { t } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const fit = useFitCount(true, container, measure, TAGS.length);
  const shown = fit ?? TAGS.length;
  return (
    <div className="flex flex-col gap-3 text-sm text-foreground">
      <div
        ref={container}
        role="list"
        aria-label={t('hooksExample.fitCount.list')}
        className="relative flex max-w-sm gap-2 overflow-hidden"
      >
        {TAGS.slice(0, shown).map((tag) => (
          <span key={tag} role="listitem" className={chip}>
            {tag}
          </span>
        ))}
        {shown < TAGS.length && (
          <span className={chip}>{t('hooksExample.fitCount.more', { count: TAGS.length - shown })}</span>
        )}
        <div
          ref={measure}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 flex gap-2"
        >
          {TAGS.map((tag) => (
            <span key={tag} className={chip}>
              {tag}
            </span>
          ))}
          <span className={chip}>{t('hooksExample.fitCount.more', { count: TAGS.length })}</span>
        </div>
      </div>
      <p>{t('hooksExample.fitCount.visible', { shown, total: TAGS.length })}</p>
    </div>
  );
}
