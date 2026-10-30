import { useI18n } from '../../../i18n/I18nProvider';
import { Button } from '../../Button';
import { Stack } from '../Stack';

export default function StackResponsiveToolbar() {
  const { t } = useI18n();
  return (
    <Stack
      data-stack-responsive-toolbar
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 2, md: 4 }}
      align={{ base: 'stretch', md: 'center' }}
      justify={{ md: 'between' }}
      wrap={{ base: false, lg: true }}
      padding={{ base: 4, md: 6 }}
      paddingInline={{ base: 3, md: 6 }}
      paddingBlock={2}
    >
      <Button variant="secondary">{t('common.cancel')}</Button>
      <Button>{t('common.save')}</Button>
    </Stack>
  );
}
