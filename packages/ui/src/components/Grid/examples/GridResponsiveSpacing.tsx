import { useI18n } from '../../../i18n/I18nProvider';
import { Grid, GridItem } from '../Grid';

export default function GridResponsiveSpacing() {
  const { t } = useI18n();
  return (
    <Grid
      data-responsive-example
      cols={{ base: 1, md: 2, '2xl': 6 }}
      gap={{ base: 2, lg: 6 }}
      rowGap={{ base: 2, md: 4 }}
      columnGap={{ base: 2, xl: 8 }}
    >
      {[1, 2, 3, 4].map((number) => (
        <GridItem
          key={number}
          span={{ '2xl': 2 }}
          className="rounded-lg border border-border bg-card p-4 text-card-foreground"
        >
          {t('responsive.item', { number })}
        </GridItem>
      ))}
      <GridItem
        span={{ base: 1, md: 2, '2xl': 'full' }}
        className="rounded-lg border border-border p-4 text-foreground"
      >
        {t('responsive.fullWidth')}
      </GridItem>
    </Grid>
  );
}
