import { useI18n } from '../../../i18n';
import { Heading, Text } from '../Text';

/** Every named role, plus inherited weight and utility overrides. */
export default function TypographyRoles() {
  const { t } = useI18n();
  return (
    <div className="grid gap-3" data-typography-preview>
      {(['display', 'body', 'label', 'supporting', 'caption', 'code'] as const).map((variant) => (
        <Text key={variant} variant={variant} data-text-variant={variant}>
          {t(`typography.${variant}`)}
        </Text>
      ))}
      {(['display', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'] as const).map((size) => (
        <Heading key={size} size={size} data-heading-size={size}>
          {t(size === 'display' ? 'typography.display' : `typography.heading-${size}`)}
        </Heading>
      ))}
      <strong>
        <Text variant="caption" data-typography-case="inherit">
          {t('typography.boldCaption')}
        </Text>
      </strong>
      <Heading size="sm" className="font-bold" data-typography-case="bold">
        {t('typography.boldHeading')}
      </Heading>
      <Text className="leading-tight" data-typography-case="tight">
        {t('typography.tightBody')}
      </Text>
    </div>
  );
}
