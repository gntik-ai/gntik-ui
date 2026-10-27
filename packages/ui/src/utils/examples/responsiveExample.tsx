import { GRID_COLS } from '../../components/Grid/grid.variants';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../cn';
import { responsiveClasses, responsiveVars, resolveResponsive } from '../responsive';

export default function ResponsiveExample() {
  const { t } = useI18n();
  const classes = responsiveClasses({ base: 1, md: 2, '2xl': 6 }, GRID_COLS);
  const width = responsiveVars('preview-width', { base: '100%', md: '32rem' });
  const label = resolveResponsive({ base: t('responsive.mobile'), md: t('responsive.desktop') }, 'lg');
  return (
    <div data-responsive-example className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('responsive.utilityDescription')}</p>
      <div
        style={width}
        className={cn(
          'grid max-w-full gap-2 w-[var(--preview-width)] md:w-[var(--preview-width-md,var(--preview-width))]',
          classes,
        )}
      >
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <div key={number} className="rounded-lg border border-border bg-card p-3 text-card-foreground">
            {t('responsive.item', { number })}
          </div>
        ))}
      </div>
      <p className="text-sm text-foreground">{label}</p>
    </div>
  );
}
