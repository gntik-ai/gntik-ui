import { Check } from '@gntik-ai/icons';
import { Stack, Text } from '@gntik-ai/ui';

export interface BrandPanelCopy {
  eyebrow: string;
  headline: string;
  features: string[];
}

/** Brand panel body for AuthLayout `split`: eyebrow, headline and a short feature list (text only). */
export function BrandPanel({ eyebrow, headline, features }: BrandPanelCopy) {
  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <Text variant="caption" tone="primary" className="font-mono tracking-[0.18em] uppercase">
          {eyebrow}
        </Text>
        <Text variant="display" className="text-[32px] text-balance">
          {headline}
        </Text>
      </Stack>
      <Stack as="ul" gap={3}>
        {features.map((feature) => (
          <Stack as="li" key={feature} direction="row" align="center" gap={3}>
            <Check size={16} aria-hidden className="shrink-0 text-primary-text" />
            <Text variant="supporting" tone="muted">
              {feature}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
