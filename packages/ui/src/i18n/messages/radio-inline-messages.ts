export const radioInlineEn = {
  'radioInline.billingCycle': 'Billing cycle',
  'radioInline.monthly': 'Monthly',
  'radioInline.annual': 'Annual',
  'radioInline.retention': 'Log retention',
  'radioInline.days7': '7 days',
  'radioInline.days30': '30 days',
  'radioInline.days90': '90 days',
} as const;

export const radioInlineEs = {
  'radioInline.billingCycle': 'Ciclo de facturación',
  'radioInline.monthly': 'Mensual',
  'radioInline.annual': 'Anual',
  'radioInline.retention': 'Retención de registros',
  'radioInline.days7': '7 días',
  'radioInline.days30': '30 días',
  'radioInline.days90': '90 días',
} satisfies Record<keyof typeof radioInlineEn, string>;
