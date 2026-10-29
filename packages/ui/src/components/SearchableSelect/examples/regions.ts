import { Globe } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nProvider';

/** The options are caller data; the example localizes them with its own catalog entries. */
export function useRegions() {
  const { t } = useI18n();
  return [
    {
      value: 'eu-west-1',
      label: t('searchableSelect.examples.zurich'),
      description: t('searchableSelect.examples.switzerland'),
      keywords: ['alpine'],
      icon: Globe,
    },
    {
      value: 'eu-central-1',
      label: t('searchableSelect.examples.zagreb'),
      description: t('searchableSelect.examples.croatia'),
      icon: Globe,
    },
    {
      value: 'eu-south-1',
      label: t('searchableSelect.examples.lisbon'),
      description: t('searchableSelect.examples.portugal'),
      icon: Globe,
    },
  ];
}
