import { useCallback, useRef } from 'react';
import { observeReducedMotion, prefersReducedMotion } from '@gntik-ai/tokens/runtime';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { Switch } from '../../components/Switch/Switch';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { StatusDot } from '../../components/StatusDot/StatusDot';

function Preview() {
  const { motion, setMotion } = useTheme();
  const { t } = useI18n();
  return (
    <>
      <Switch
        label={t('motion.reduce')}
        checked={motion === 'reduce'}
        onCheckedChange={(checked) => setMotion(checked ? 'reduce' : 'system')}
      />
      <p className="text-sm text-muted-foreground">{t('motion.description')}</p>
      <Skeleton data-testid="motion-skeleton" className="h-4 w-32" />
      <StatusDot pulse label={t('motion.preview')} />
      <output
        className="block text-sm text-muted-foreground"
        ref={(el) => {
          if (!el) return;
          // The React-free runtime also works with a local DOM target, e.g. a canvas wrapper.
          const update = (reduced: boolean) => {
            el.textContent = t(reduced ? 'motion.reduced' : 'motion.system');
          };
          update(prefersReducedMotion(el));
          return observeReducedMotion(update, el);
        }}
      />
    </>
  );
}

/** A local target keeps the catalog's page preference independent of this demonstration. */
export default function ThemeProviderMotion() {
  const { resolved } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const target = useCallback(() => ref.current, []);
  return (
    <div className="space-y-4">
      <div ref={ref} data-testid="motion-scope" className="space-y-3 rounded-lg bg-background p-4 text-foreground">
        <ThemeProvider
          forcedMode={resolved}
          defaultMotion="reduce"
          storageKey={null}
          motionStorageKey={null}
          target={target}
        >
          <Preview />
        </ThemeProvider>
      </div>
      <Skeleton data-testid="unscoped-skeleton" className="h-4 w-32" />
      <StatusDot data-testid="unscoped-dot" pulse />
    </div>
  );
}
